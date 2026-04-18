import { UserRole } from '../domain/enums';
import { Permission } from '../domain/enums';

/**
 * RBAC service interface. Enforce at service layer even when route guards exist.
 */

export interface RequirePermissionOptions {
  dualControlEnabled?: boolean;
  creatorUserId?: string | null;
}

export interface IRbacService {
  getRolesForActor(
    tenantGroupId: string,
    actorUserId: string | null,
    memberIdFallback?: string,
  ): Promise<UserRole[]>;
  hasPermission(
    tenantGroupId: string,
    actorUserId: string | null,
    permission: Permission,
    memberIdFallback?: string,
  ): Promise<boolean>;
  requirePermission(
    tenantGroupId: string,
    actorUserId: string | null,
    permission: Permission,
    options?: RequirePermissionOptions,
    memberIdFallback?: string,
  ): Promise<void>;
  requireRole(
    tenantGroupId: string,
    actorUserId: string | null,
    allowedRoles: UserRole[],
    memberIdFallback?: string,
  ): Promise<void>;
}
