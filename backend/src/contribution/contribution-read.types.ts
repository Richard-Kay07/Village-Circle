/**
 * Read models for contribution queries. All amounts in minor units.
 * Sensitive fields (externalReferenceText) are optional and gated by RBAC.
 */

export interface ContributionRowRead {
  id: string;
  tenantGroupId: string;
  meetingId: string | null;
  memberProfileId: string;
  transactionMode: string | null;
  savingsAmountMinor: number;
  socialFundAmountMinor: number;
  totalAmountMinor: number;
  /** Present only when caller has permission (e.g. REPORT_EXPORT or AUDIT_READ). */
  externalReferenceText?: string | null;
  evidencePresence: EvidencePresence;
  ledgerEventId: string | null;
  status: string;
  recordedAt: Date | null;
  createdAt: Date;
}

export interface EvidencePresence {
  hasText: boolean;
  hasImage: boolean;
  /** Evidence file id when hasImage; for resolving metadata via Evidence API. */
  evidenceAttachmentId: string | null;
}

export interface MeetingContributionSummary {
  meetingId: string;
  tenantGroupId: string;
  heldAt: Date;
  meetingName: string | null;
  totalSavingsMinor: number;
  totalSocialFundMinor: number;
  totalAmountMinor: number;
  byMode: {
    CASH: { count: number; savingsMinor: number; socialFundMinor: number };
    BANK_TRANSFER: { count: number; savingsMinor: number; socialFundMinor: number };
  };
  contributions: ContributionRowRead[];
}

export interface MemberContributionHistoryResult {
  memberProfileId: string;
  tenantGroupId: string;
  contributions: ContributionRowRead[];
  totalSavingsMinor: number;
  totalSocialFundMinor: number;
  totalAmountMinor: number;
}

export interface UnreconciledBankTransferItem {
  id: string;
  tenantGroupId: string;
  meetingId: string | null;
  memberProfileId: string;
  savingsAmountMinor: number;
  socialFundAmountMinor: number;
  totalAmountMinor: number;
  externalReferenceText?: string | null;
  evidencePresence: EvidencePresence;
  ledgerEventId: string | null;
  recordedAt: Date | null;
  createdAt: Date;
}

export interface CashTotalsByMeetingOrDate {
  /** Grouping key: meetingId or date string (YYYY-MM-DD). */
  groupKey: string;
  isMeeting: boolean;
  meetingId: string | null;
  date: string;
  meetingName?: string | null;
  count: number;
  totalSavingsMinor: number;
  totalSocialFundMinor: number;
  totalAmountMinor: number;
}

export interface ContributionQueryFilters {
  dateFrom?: string; // ISO date YYYY-MM-DD
  dateTo?: string;
  meetingId?: string;
  memberId?: string;
  transactionMode?: 'CASH' | 'BANK_TRANSFER';
  /** Filter contributions that have this fund bucket > 0 */
  fundBucket?: 'SAVINGS' | 'SOCIAL_FUND';
  status?: 'RECORDED' | 'REVERSED';
}

export interface GroupContributionListResult {
  contributions: ContributionRowRead[];
  totalSavingsMinor: number;
  totalSocialFundMinor: number;
  totalAmountMinor: number;
  byMode: {
    CASH: { count: number; savingsMinor: number; socialFundMinor: number };
    BANK_TRANSFER: { count: number; savingsMinor: number; socialFundMinor: number };
  };
}
