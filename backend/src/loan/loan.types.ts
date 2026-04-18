import type { LoanRuleSnapshot } from '../group-rules/group-rules.types';

/** Submit a loan application. */
export interface SubmitApplicationDto {
  tenantGroupId: string;
  memberProfileId: string;
  requestedAmountMinor: number;
  requestedTermPeriods: number;
  purpose?: string;
  submittedByUserId: string;
}

/** Approve application: creates Loan + schedule using rule snapshot at approval time. */
export interface ApproveApplicationDto {
  applicationId: string;
  tenantGroupId: string;
  approvedByUserId: string;
}

/** Record disbursement (external transaction evidence). */
export interface RecordDisbursementDto {
  loanId: string;
  tenantGroupId: string;
  transactionMode: 'CASH' | 'BANK_TRANSFER';
  externalReferenceText?: string;
  evidenceAttachmentId?: string;
  recordedByUserId: string;
}

/** Record repayment (idempotent). Allocation: penalty first, then interest, then principal. */
export interface RecordRepaymentDto {
  loanId: string;
  tenantGroupId: string;
  transactionMode: 'CASH' | 'BANK_TRANSFER';
  amountMinor: number;
  externalReferenceText?: string;
  evidenceAttachmentId?: string;
  recordedByUserId: string;
  idempotencyKey: string;
}

export interface LoanScheduleItemDto {
  installmentNo: number;
  dueDate: Date;
  principalDueMinor: number;
  interestDueMinor: number;
  penaltyDueMinor: number;
  totalDueMinor: number;
  status: string;
}

/** Allocation result for a repayment (MVP: penalty → interest → principal). */
export interface RepaymentAllocation {
  principalMinor: number;
  interestMinor: number;
  penaltyMinor: number;
}

/** Record waiver event (reason + approver required). */
export interface RecordWaiverDto {
  loanId: string;
  tenantGroupId: string;
  reason: string;
  approvedByUserId: string;
  scheduleItemId?: string;
  amountMinorWaived: number;
  waiverType?: 'PENALTY' | 'INTEREST' | 'BOTH';
}

/** Record reschedule event; prior schedule items are marked superseded. */
export interface RecordRescheduleDto {
  loanId: string;
  tenantGroupId: string;
  reason: string;
  approvedByUserId: string;
  newTermPeriods: number;
  firstDueDate: Date;
}

/** Record write-off event (skeleton: capability check + domain error until fully implemented). */
export interface RecordWriteOffDto {
  loanId: string;
  tenantGroupId: string;
  reason: string;
  approvedByUserId: string;
}
