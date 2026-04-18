import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RbacService } from '../rbac/rbac.service';
import { AuditLogService } from '../audit/audit-log.service';
import { UserRole } from '../domain/enums';
import { AuditChannel } from '../domain/enums';
import { GroupRole } from '@prisma/client';
import { ForbiddenError, ValidationError } from '../domain/errors';
import {
  DuplicateRoleAssignmentError,
  TenantGroupNotFoundError,
  UserNotFoundError,
  NoActiveRoleAssignmentError,
} from './role-assignment.errors';

export interface AssignRoleInput {
  tenantGroupId: string;
  userId: string;
  role: GroupRole;
  actorUserId: string;
  channel: AuditChannel;
  actorMemberId?: string;
}

export interface RevokeRoleInput {
  tenantGroupId: string;
  userId: string;
  role: GroupRole;
  actorUserId: string;
  channel: AuditChannel;
  actorMemberId?: string;
}

export interface ChangeRoleInput {
  tenantGroupId: string;
  userId: string;
  fromRole: GroupRole;
  toRole: GroupRole;
  actorUserId: string;
  channel: AuditChannel;
  actorMemberId?: string;
}

export interface TenantUserRoleItem {
  userId: string;
  role: GroupRole;
  assignmentId: string;
  createdAt: Date;
}

@Injectable()
export class RoleAssignmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rbac: RbacService,
    private readonly auditLog: AuditLogService,
  ) {}

  /** Require GROUP_CHAIR or PLATFORM_ADMIN for role changes. */
  private async requireRoleChangePermission(
    tenantGroupId: string,
    actorUserId: string,
    actorMemberId?: string,
  ): Promise<void> {
    await this.rbac.requireRole(
      tenantGroupId,
      actorUserId,
      [UserRole.GROUP_CHAIR, UserRole.PLATFORM_ADMIN],
      actorMemberId,
    );
  }

  async assign(input: AssignRoleInput): Promise<{ id: string }> {
    if (!input.tenantGroupId?.trim() || !input.userId?.trim()) {
      throw new ValidationError('tenantGroupId and userId are required', {
        tenantGroupId: input.tenantGroupId,
        userId: input.userId,
      });
    }
    await this.requireRoleChangePermission(
      input.tenantGroupId,
      input.actorUserId,
      input.actorMemberId,
    );
    const group = await this.prisma.group.findUnique({
      where: { id: input.tenantGroupId },
    });
    if (!group) throw new TenantGroupNotFoundError(input.tenantGroupId);
    const user = await this.prisma.user.findUnique({
      where: { id: input.userId },
    });
    if (!user) throw new UserNotFoundError(input.userId);

    const existing = await this.prisma.roleAssignment.findFirst({
      where: {
        tenantGroupId: input.tenantGroupId,
        userId: input.userId,
        role: input.role,
        status: 'ACTIVE',
      },
    });
    if (existing) {
      throw new DuplicateRoleAssignmentError(
        input.tenantGroupId,
        input.userId,
        input.role,
      );
    }

    const assignment = await this.prisma.roleAssignment.create({
      data: {
        tenantGroupId: input.tenantGroupId,
        userId: input.userId,
        role: input.role,
        status: 'ACTIVE',
        createdByUserId: input.actorUserId,
      },
    });

    await this.auditLog.append({
      tenantGroupId: input.tenantGroupId,
      actorUserId: input.actorUserId,
      channel: input.channel,
      action: 'ROLE_ASSIGNED',
      entityType: 'ROLE_ASSIGNMENT',
      entityId: assignment.id,
      afterSnapshot: {
        userId: input.userId,
        role: input.role,
        status: 'ACTIVE',
        createdAt: assignment.createdAt.toISOString(),
      },
      metadata: { createdByUserId: input.actorUserId },
    });

    return { id: assignment.id };
  }

  async revoke(input: RevokeRoleInput): Promise<{ id: string }> {
    if (!input.tenantGroupId?.trim() || !input.userId?.trim()) {
      throw new ValidationError('tenantGroupId and userId are required');
    }
    await this.requireRoleChangePermission(
      input.tenantGroupId,
      input.actorUserId,
      input.actorMemberId,
    );
    const assignment = await this.prisma.roleAssignment.findFirst({
      where: {
        tenantGroupId: input.tenantGroupId,
        userId: input.userId,
        role: input.role,
        status: 'ACTIVE',
      },
    });
    if (!assignment) {
      throw new NoActiveRoleAssignmentError(
        input.tenantGroupId,
        input.userId,
        input.role,
      );
    }

    const beforeSnapshot = {
      userId: assignment.userId,
      role: assignment.role,
      status: assignment.status,
      createdAt: assignment.createdAt.toISOString(),
    };
    const now = new Date();
    await this.prisma.roleAssignment.update({
      where: { id: assignment.id },
      data: {
        status: 'REVOKED',
        revokedAt: now,
        revokedByUserId: input.actorUserId,
      },
    });

    await this.auditLog.append({
      tenantGroupId: input.tenantGroupId,
      actorUserId: input.actorUserId,
      channel: input.channel,
      action: 'ROLE_REVOKED',
      entityType: 'ROLE_ASSIGNMENT',
      entityId: assignment.id,
      beforeSnapshot,
      afterSnapshot: {
        ...beforeSnapshot,
        status: 'REVOKED',
        revokedAt: now.toISOString(),
        revokedByUserId: input.actorUserId,
      },
      metadata: { revokedByUserId: input.actorUserId },
    });

    return { id: assignment.id };
  }

  /** Change role: revoke fromRole and assign toRole. Two audit events. */
  async change(input: ChangeRoleInput): Promise<{ revokeId: string; assignId: string }> {
    const { id: revokeId } = await this.revoke({
      tenantGroupId: input.tenantGroupId,
      userId: input.userId,
      role: input.fromRole,
      actorUserId: input.actorUserId,
      channel: input.channel,
      actorMemberId: input.actorMemberId,
    });
    const { id: assignId } = await this.assign({
      tenantGroupId: input.tenantGroupId,
      userId: input.userId,
      role: input.toRole,
      actorUserId: input.actorUserId,
      channel: input.channel,
      actorMemberId: input.actorMemberId,
    });
    return { revokeId, assignId };
  }

  async listByTenant(
    tenantGroupId: string,
    actorUserId: string,
    actorMemberId?: string,
  ): Promise<TenantUserRoleItem[]> {
    await this.rbac.requireRole(
      tenantGroupId,
      actorUserId,
      [UserRole.GROUP_CHAIR, UserRole.PLATFORM_ADMIN, UserRole.GROUP_SECRETARY, UserRole.GROUP_AUDITOR],
      actorMemberId,
    );
    const assignments = await this.prisma.roleAssignment.findMany({
      where: { tenantGroupId, status: 'ACTIVE' },
      orderBy: [{ userId: 'asc' }, { role: 'asc' }],
    });
    return assignments.map((a) => ({
      userId: a.userId,
      role: a.role,
      assignmentId: a.id,
      createdAt: a.createdAt,
    }));
  }
}
