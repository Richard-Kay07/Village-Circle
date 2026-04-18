/**
 * Explicit capabilities for RBAC. Check permissions, not only role names.
 */
export enum Permission {
  GROUP_MANAGE_ROLES = 'group.manage_roles',
  GROUP_MANAGE_RULES = 'group.manage_rules',
  MEETING_RECORD = 'meeting.record',
  CONTRIBUTION_RECORD = 'contribution.record',
  CONTRIBUTION_REVERSE = 'contribution.reverse',
  LOAN_APPLY = 'loan.apply',
  LOAN_APPROVE = 'loan.approve',
  LOAN_DISBURSEMENT_RECORD = 'loan.disbursement.record',
  LOAN_REPAYMENT_RECORD = 'loan.repayment.record',
  LOAN_WAIVE = 'loan.waive',
  LOAN_WRITEOFF = 'loan.writeoff',
  LOAN_RESCHEDULE = 'loan.reschedule',
  LEDGER_ADJUST = 'ledger.adjust',
  REPORT_EXPORT = 'report.export',
  AUDIT_READ = 'audit.read',
  ADMIN_SUPPORT_ACCESS = 'admin.support_access',
  /** Privileged manual resend/retry for failed notifications (e.g. SMS). */
  NOTIFICATION_RESEND = 'notification.resend',
}

export const PERMISSION_VALUES: readonly string[] = Object.values(Permission) as string[];

export function parsePermission(value: unknown): Permission {
  if (typeof value !== 'string') {
    throw new Error(`Invalid Permission: expected string, got ${typeof value}`);
  }
  if (!PERMISSION_VALUES.includes(value)) {
    throw new Error(`Invalid Permission: ${value}`);
  }
  return value as Permission;
}

export function isPermission(value: unknown): value is Permission {
  return typeof value === 'string' && PERMISSION_VALUES.includes(value);
}
