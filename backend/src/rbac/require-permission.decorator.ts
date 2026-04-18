import { SetMetadata } from '@nestjs/common';
import { Permission } from '../domain/enums';

export const REQUIRE_PERMISSION_KEY = 'requirePermission';

/**
 * Decorate a handler to require the given permission in the tenant.
 * Use with RequirePermissionGuard. Pass tenantGroupId and actorUserId via body/params/query.
 */
export const RequirePermission = (permission: Permission) =>
  SetMetadata(REQUIRE_PERMISSION_KEY, permission);
