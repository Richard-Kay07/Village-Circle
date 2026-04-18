import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '../domain/enums';
import { Permission } from '../domain/enums';
import {
  getPermissionsForRole,
  roleHasPermission,
  requiresDualControl,
  ROLE_PERMISSIONS,
} from './role-permissions';
import { groupRoleToUserRole, memberRoleToUserRole } from './role-mapping';
import { ForbiddenError } from '../domain/errors';

export interface RequirePermissionOptions {
  /** When dual control is enabled, creatorUserId must differ from actor. */
  dualControlEnabled?: boolean;
  creatorUserId?: string | null;
}

export interface SegregationCheckInput {
  permission: Permission;
  actorUserId: string;
  creatorUserId?: string | null;
  dualControlEnabled: boolean;
}

@Injectable()
export class RbacService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resolve roles for an actor in a tenant group.
   * actorUserId: platform User.id when authenticated; memberIdFallback used when pilot sends memberId only.
   */
  async getRolesForActor(
    tenantGroupId: string,
    actorUserId: string | null,
    memberIdFallback?: string,
  ): Promise<UserRole[]> {
    let member: { userId: string | null; role: string; groupRole: string | null; user?: { platformRole: string | null } | null } | null = null;

    if (actorUserId) {
      member = await this.prisma.member.findFirst({
        where: { groupId: tenantGroupId, userId: actorUserId, status: 'ACTIVE' },
        include: { user: { select: { platformRole: true } } },
      });
    }
    if (!member && memberIdFallback) {
      member = await this.prisma.member.findFirst({
        where: { id: memberIdFallback, groupId: tenantGroupId, status: 'ACTIVE' },
        include: { user: { select: { platformRole: true } } },
      });
    }
    if (!member) return [];

    const roles: UserRole[] = [];
    if (member.user?.platformRole === 'PLATFORM_ADMIN') {
      roles.push(UserRole.PLATFORM_ADMIN);
    }
    if (member.groupRole) {
      roles.push(groupRoleToUserRole(member.groupRole as import('@prisma/client').GroupRole));
    } else {
      roles.push(memberRoleToUserRole(member.role as import('@prisma/client').MemberRole));
    }
    if (member.userId) {
      const assignments = await this.prisma.roleAssignment.findMany({
        where: {
          tenantGroupId,
          userId: member.userId,
          status: 'ACTIVE',
        },
      });
      assignments.forEach((ra) => {
        const ur = groupRoleToUserRole(ra.role);
        if (!roles.includes(ur)) roles.push(ur);
      });
    }
    return roles;
  }

  /** Check if actor has the given permission in the tenant (by role). */
  async hasPermission(
    tenantGroupId: string,
    actorUserId: string | null,
    permission: Permission,
    memberIdFallback?: string,
  ): Promise<boolean> {
    const roles = await this.getRolesForActor(tenantGroupId, actorUserId, memberIdFallback);
    return roles.some((r) => roleHasPermission(r, permission));
  }

  /**
   * Enforce permission; throws ForbiddenError if not allowed.
   * Optionally enforces segregation of duties when dualControlEnabled and permission is high-risk.
   */
  async requirePermission(
    tenantGroupId: string,
    actorUserId: string | null,
    permission: Permission,
    options: RequirePermissionOptions = {},
    memberIdFallback?: string,
  ): Promise<void> {
    const roles = await this.getRolesForActor(tenantGroupId, actorUserId, memberIdFallback);
    const allowed = roles.some((r) => roleHasPermission(r, permission));
    if (!allowed) {
      throw new ForbiddenError(`Missing permission: ${permission}`, { permission });
    }
    if (options.dualControlEnabled && options.creatorUserId != null && actorUserId) {
      this.assertSegregation(permission, actorUserId, options.creatorUserId);
    }
  }

  /** Block same user from both create and approve when dual control is required. */
  assertSegregation(
    permission: Permission,
    actorUserId: string,
    creatorUserId: string,
  ): void {
    if (!requiresDualControl(permission)) return;
    if (actorUserId === creatorUserId) {
      throw new ForbiddenError(
        `Segregation of duties: same user cannot both create and approve ${permission}`,
        { permission },
      );
    }
  }

  /** Require one of the given roles (convenience). */
  async requireRole(
    tenantGroupId: string,
    actorUserId: string | null,
    allowedRoles: UserRole[],
    memberIdFallback?: string,
  ): Promise<void> {
    const roles = await this.getRolesForActor(tenantGroupId, actorUserId, memberIdFallback);
    const hasAny = roles.some((r) => allowedRoles.includes(r));
    if (!hasAny) {
      throw new ForbiddenError(`Required one of roles: ${allowedRoles.join(', ')}`, {
        allowedRoles: allowedRoles as string[],
      });
    }
  }
}

// Re-export for tests and consumers
export { getPermissionsForRole, roleHasPermission, requiresDualControl, ROLE_PERMISSIONS };
