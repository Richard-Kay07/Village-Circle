/**
 * High-level notification triggers for domain events.
 * Implementations must not throw; log failures and persist intent where possible.
 */

export interface ContributionReceiptTriggerPayload {
  tenantGroupId: string;
  memberId: string;
  contributionId: string;
  recordType?: string;
}

export interface ApprovalRequiredTriggerPayload {
  tenantGroupId: string;
  applicationId: string;
  memberDisplayName?: string;
  requestedAmountMinor?: number;
}

export interface ApprovalDecisionTriggerPayload {
  tenantGroupId: string;
  memberId: string;
  applicationId: string;
  approved: boolean;
}

export interface OverdueReminderTriggerOptions {
  tenantGroupId?: string;
  loanId?: string;
}

export interface MeetingReminderTriggerOptions {
  meetingId?: string;
  tenantGroupId?: string;
  /** For scheduler: notify for meetings held in the next N hours (default 24). */
  withinHours?: number;
}

export interface INotificationTriggerService {
  contributionReceipt(payload: ContributionReceiptTriggerPayload): Promise<void>;
  approvalRequired(payload: ApprovalRequiredTriggerPayload): Promise<void>;
  approvalDecision(payload: ApprovalDecisionTriggerPayload): Promise<void>;
  enqueueOverdueReminders(options?: OverdueReminderTriggerOptions): Promise<{ enqueued: number }>;
  enqueueMeetingReminders(options?: MeetingReminderTriggerOptions): Promise<{ enqueued: number }>;
}
