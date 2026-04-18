import { NotFoundError, DomainRuleError } from '../domain/errors';

/** Thrown when attempting to assign a role that is already active for the user in the tenant. */
export class DuplicateRoleAssignmentError extends DomainRuleError {
  constructor(
    tenantGroupId: string,
    userId: string,
    role: string,
  ) {
    super(
      `Active role assignment already exists: tenantGroupId=${tenantGroupId}, userId=${userId}, role=${role}`,
      { tenantGroupId, userId, role },
    );
    this.name = 'DuplicateRoleAssignmentError';
  }
}

/** Thrown when the tenant group does not exist. */
export class TenantGroupNotFoundError extends NotFoundError {
  constructor(tenantGroupId: string) {
    super(`Tenant group not found: ${tenantGroupId}`, { tenantGroupId });
  }
}

/** Thrown when the user does not exist. */
export class UserNotFoundError extends NotFoundError {
  constructor(userId: string) {
    super(`User not found: ${userId}`, { userId });
  }
}

/** Thrown when no active assignment exists to revoke. */
export class NoActiveRoleAssignmentError extends DomainRuleError {
  constructor(
    tenantGroupId: string,
    userId: string,
    role: string,
  ) {
    super(
      `No active role assignment to revoke: tenantGroupId=${tenantGroupId}, userId=${userId}, role=${role}`,
      { tenantGroupId, userId, role },
    );
    this.name = 'NoActiveRoleAssignmentError';
  }
}
