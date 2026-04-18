/**
 * Permission strings aligned with backend Permission enum.
 * Frontend uses these for RBAC-aware UI; backend remains source of truth.
 */
export const PERMISSIONS = [
  'group.manage_roles',
  'group.manage_rules',
  'meeting.record',
  'contribution.record',
  'contribution.reverse',
  'loan.apply',
  'loan.approve',
  'loan.disbursement.record',
  'loan.repayment.record',
  'loan.waive',
  'loan.writeoff',
  'loan.reschedule',
  'ledger.adjust',
  'report.export',
  'audit.read',
  'admin.support_access',
  'notification.resend',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export type Capabilities = readonly Permission[];

export function isPermission(value: unknown): value is Permission {
  return typeof value === 'string' && (PERMISSIONS as readonly string[]).includes(value);
}

export function hasCapability(capabilities: Capabilities, permission: Permission): boolean {
  return capabilities.includes(permission);
}
