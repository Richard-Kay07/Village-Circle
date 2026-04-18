import { UserRole } from '../domain/enums';
import { Permission } from '../domain/enums';

/**
 * Maps each role to the set of permissions it grants.
 * PLATFORM_ADMIN is checked separately (all permissions + admin.support_access).
 */
export const ROLE_PERMISSIONS: Readonly<Record<UserRole, readonly Permission[]>> = {
  [UserRole.PLATFORM_ADMIN]: [
    Permission.GROUP_MANAGE_ROLES,
    Permission.GROUP_MANAGE_RULES,
    Permission.MEETING_RECORD,
    Permission.CONTRIBUTION_RECORD,
    Permission.CONTRIBUTION_REVERSE,
    Permission.LOAN_APPLY,
    Permission.LOAN_APPROVE,
    Permission.LOAN_DISBURSEMENT_RECORD,
    Permission.LOAN_REPAYMENT_RECORD,
    Permission.LOAN_WAIVE,
    Permission.LOAN_WRITEOFF,
    Permission.LOAN_RESCHEDULE,
    Permission.LEDGER_ADJUST,
    Permission.REPORT_EXPORT,
    Permission.AUDIT_READ,
    Permission.ADMIN_SUPPORT_ACCESS,
    Permission.NOTIFICATION_RESEND,
  ],
  [UserRole.GROUP_CHAIR]: [
    Permission.GROUP_MANAGE_ROLES,
    Permission.GROUP_MANAGE_RULES,
    Permission.MEETING_RECORD,
    Permission.CONTRIBUTION_RECORD,
    Permission.CONTRIBUTION_REVERSE,
    Permission.LOAN_APPLY,
    Permission.LOAN_APPROVE,
    Permission.LOAN_DISBURSEMENT_RECORD,
    Permission.LOAN_REPAYMENT_RECORD,
    Permission.LOAN_WAIVE,
    Permission.LOAN_WRITEOFF,
    Permission.LOAN_RESCHEDULE,
    Permission.LEDGER_ADJUST,
    Permission.REPORT_EXPORT,
    Permission.AUDIT_READ,
    Permission.NOTIFICATION_RESEND,
  ],
  [UserRole.GROUP_TREASURER]: [
    Permission.CONTRIBUTION_RECORD,
    Permission.CONTRIBUTION_REVERSE,
    Permission.LOAN_DISBURSEMENT_RECORD,
    Permission.LOAN_REPAYMENT_RECORD,
    Permission.LOAN_WAIVE,
    Permission.LOAN_WRITEOFF,
    Permission.LOAN_RESCHEDULE,
    Permission.LEDGER_ADJUST,
    Permission.REPORT_EXPORT,
    Permission.AUDIT_READ,
    Permission.NOTIFICATION_RESEND,
  ],
  [UserRole.GROUP_SECRETARY]: [
    Permission.MEETING_RECORD,
    Permission.REPORT_EXPORT,
    Permission.AUDIT_READ,
  ],
  [UserRole.GROUP_AUDITOR]: [
    Permission.AUDIT_READ,
    Permission.REPORT_EXPORT,
  ],
  [UserRole.MEMBER]: [
    Permission.CONTRIBUTION_RECORD,
    Permission.LOAN_APPLY,
    Permission.LOAN_REPAYMENT_RECORD,
  ],
};

/** High-risk actions that may require dual control (creator ≠ approver). */
export const DUAL_CONTROL_ACTIONS: ReadonlySet<Permission> = new Set([
  Permission.LOAN_APPROVE,
  Permission.CONTRIBUTION_REVERSE,
  Permission.LOAN_WAIVE,
  Permission.LOAN_WRITEOFF,
  Permission.LOAN_RESCHEDULE,
  Permission.LEDGER_ADJUST,
]);

export function getPermissionsForRole(role: UserRole): readonly Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function roleHasPermission(role: UserRole, permission: Permission): boolean {
  if (role === UserRole.PLATFORM_ADMIN) return true;
  return (ROLE_PERMISSIONS[role] ?? []).includes(permission);
}

export function requiresDualControl(permission: Permission): boolean {
  return DUAL_CONTROL_ACTIONS.has(permission);
}
