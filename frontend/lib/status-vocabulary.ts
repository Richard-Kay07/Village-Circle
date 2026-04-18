/**
 * Status and timeline action vocabulary for VillageCircle360 UK MVP.
 * Maps domain statuses and audit actions to display labels and StatusId for badges.
 * Pair badges with labels; do not rely on colour alone.
 *
 * @see docs/STATUS_TIMELINE_PRESENTATION.md
 */

import type { StatusId } from '@/lib/design-system/tokens';

/** Domain for status context */
export type StatusDomain =
  | 'contribution'
  | 'loan'
  | 'repayment'
  | 'notification'
  | 'evidence'
  | 'admin_support';

/** Entry: display label + optional StatusId for badge (uses statusTokens) */
export interface StatusVocabularyEntry {
  label: string;
  statusId: StatusId;
}

/** Audit/timeline action key (backend may send these) */
export type AuditActionKey =
  | 'CONTRIBUTION_RECORDED'
  | 'CONTRIBUTION_REVERSED'
  | 'LOAN_APPLICATION_SUBMITTED'
  | 'LOAN_APPROVED'
  | 'LOAN_DISBURSEMENT_RECORDED'
  | 'LOAN_REPAYMENT_RECORDED'
  | 'LOAN_WAIVED'
  | 'LOAN_RESCHEDULED'
  | 'LOAN_WRITEOFF_RECORDED'
  | 'EVIDENCE_ATTACHED'
  | 'SUPPORT_ACCESS_STARTED'
  | 'SUPPORT_EVIDENCE_VIEWED'
  | 'NOTIFICATION_SENT'
  | 'NOTIFICATION_DELIVERED'
  | 'NOTIFICATION_FAILED'
  | 'SMS_WEBHOOK_DELIVERED'
  | 'SMS_WEBHOOK_FAILED';

/** Action key -> human-readable action label for timeline */
export const AUDIT_ACTION_LABELS: Record<AuditActionKey, string> = {
  CONTRIBUTION_RECORDED: 'Contribution recorded',
  CONTRIBUTION_REVERSED: 'Contribution reversed',
  LOAN_APPLICATION_SUBMITTED: 'Loan application submitted',
  LOAN_APPROVED: 'Loan approved',
  LOAN_DISBURSEMENT_RECORDED: 'Disbursement recorded',
  LOAN_REPAYMENT_RECORDED: 'Repayment recorded',
  LOAN_WAIVED: 'Loan waiver recorded',
  LOAN_RESCHEDULED: 'Loan rescheduled',
  LOAN_WRITEOFF_RECORDED: 'Write-off recorded',
  EVIDENCE_ATTACHED: 'Evidence attached',
  SUPPORT_ACCESS_STARTED: 'Support access started',
  SUPPORT_EVIDENCE_VIEWED: 'Evidence viewed (support)',
  NOTIFICATION_SENT: 'Notification sent',
  NOTIFICATION_DELIVERED: 'Notification delivered',
  NOTIFICATION_FAILED: 'Notification failed',
  SMS_WEBHOOK_DELIVERED: 'SMS delivered',
  SMS_WEBHOOK_FAILED: 'SMS delivery failed',
};

/** Contribution status (API: RECORDED, REVERSED) -> vocabulary */
export const CONTRIBUTION_STATUS_VOCAB: Record<string, StatusVocabularyEntry> = {
  RECORDED: { label: 'Recorded', statusId: 'recorded' },
  REVERSED: { label: 'Reversed', statusId: 'reversed' },
};

/** Loan status (application/loan state) -> vocabulary */
export const LOAN_STATUS_VOCAB: Record<string, StatusVocabularyEntry> = {
  PENDING: { label: 'Pending', statusId: 'pending' },
  APPROVED: { label: 'Approved', statusId: 'approved' },
  DISBURSEMENT_RECORDED: { label: 'Disbursed', statusId: 'recorded' },
  ACTIVE: { label: 'Active', statusId: 'recorded' },
  OVERDUE: { label: 'Overdue', statusId: 'overdue' },
  REPAID: { label: 'Repaid', statusId: 'recorded' },
  REVERSED: { label: 'Reversed', statusId: 'reversed' },
  WAIVED: { label: 'Waived', statusId: 'reversed' },
  WRITEOFF: { label: 'Write-off', statusId: 'reversed' },
};

/** Repayment record status */
export const REPAYMENT_STATUS_VOCAB: Record<string, StatusVocabularyEntry> = {
  RECORDED: { label: 'Recorded', statusId: 'recorded' },
  PENDING: { label: 'Pending', statusId: 'pending' },
};

/** Notification/SMS delivery status -> vocabulary */
export const NOTIFICATION_STATUS_VOCAB: Record<string, StatusVocabularyEntry> = {
  SENT: { label: 'Sent', statusId: 'recorded' },
  DELIVERED: { label: 'Delivered', statusId: 'delivered' },
  FAILED: { label: 'Failed', statusId: 'failed' },
  PENDING: { label: 'Pending', statusId: 'pending' },
};

/** Evidence: attached/present (no separate status in MVP) */
export const EVIDENCE_STATUS_VOCAB: Record<string, StatusVocabularyEntry> = {
  ATTACHED: { label: 'Attached', statusId: 'recorded' },
  PRESENT: { label: 'Present', statusId: 'recorded' },
};

/** Admin support access: session started (audit only) */
export const ADMIN_SUPPORT_STATUS_VOCAB: Record<string, StatusVocabularyEntry> = {
  STARTED: { label: 'Access started', statusId: 'recorded' },
  EVIDENCE_VIEWED: { label: 'Evidence viewed', statusId: 'recorded' },
};

/** Get vocabulary by domain */
export function getStatusVocabulary(domain: StatusDomain): Record<string, StatusVocabularyEntry> {
  switch (domain) {
    case 'contribution':
      return CONTRIBUTION_STATUS_VOCAB;
    case 'loan':
      return LOAN_STATUS_VOCAB;
    case 'repayment':
      return REPAYMENT_STATUS_VOCAB;
    case 'notification':
      return NOTIFICATION_STATUS_VOCAB;
    case 'evidence':
      return EVIDENCE_STATUS_VOCAB;
    case 'admin_support':
      return ADMIN_SUPPORT_STATUS_VOCAB;
    default:
      return {};
  }
}

/** Get timeline action label; fallback to raw action if unknown */
export function getAuditActionLabel(actionKey: string): string {
  if (actionKey in AUDIT_ACTION_LABELS) {
    return AUDIT_ACTION_LABELS[actionKey as AuditActionKey];
  }
  return actionKey.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Get status label and StatusId for a domain + raw status string */
export function getStatusLabelAndId(
  domain: StatusDomain,
  rawStatus: string
): StatusVocabularyEntry | undefined {
  const vocab = getStatusVocabulary(domain);
  const key = rawStatus?.toUpperCase?.() ?? rawStatus;
  return vocab[key];
}
