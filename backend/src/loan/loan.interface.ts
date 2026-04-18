/**
 * Loan module interfaces. Canonical DTOs and types are in loan.types.ts.
 * This file provides service-level interfaces for the loan engine (application, approval, disbursement, repayment).
 */

import type { SubmitApplicationDto, ApproveApplicationDto, RecordDisbursementDto, RecordRepaymentDto } from './loan.types';

export interface ILoanService {
  submitApplication(params: SubmitApplicationDto & { actorMemberId?: string; actorUserId?: string }): Promise<{ id: string }>;
  approveApplication(params: ApproveApplicationDto & { actorMemberId?: string; actorUserId?: string }): Promise<{ loanId: string }>;
  rejectApplication(applicationId: string, tenantGroupId: string, actorUserId?: string, actorMemberId?: string): Promise<void>;
  recordDisbursement(params: RecordDisbursementDto & { actorMemberId?: string; actorUserId?: string }): Promise<{ id: string }>;
  recordRepayment(params: RecordRepaymentDto & { actorMemberId?: string; actorUserId?: string }): Promise<{ id: string; createdAt: Date }>;
  getLoan(loanId: string, actorMemberId: string): Promise<LoanDetail>;
  listByGroup(groupId: string, actorMemberId: string): Promise<LoanListItem[]>;
}

export type { SubmitApplicationDto, ApproveApplicationDto, RecordDisbursementDto, RecordRepaymentDto };

export interface LoanDetail {
  id: string;
  groupId: string;
  borrowerId: string;
  principalAmountMinor: number;
  currencyCode: string;
  interestEnabledSnapshot: boolean;
  interestRateBpsSnapshot: number | null;
  interestBasisSnapshot: string | null;
  ruleVersionIdSnapshot: string | null;
  termPeriods: number;
  state: string;
  approvedByUserId: string | null;
  approvedAt: Date | null;
  disbursementRecordedAt: Date | null;
  createdAt: Date;
  scheduleItems?: Array<{
    id: string;
    installmentNo: number;
    dueDate: Date;
    principalDueMinor: number;
    interestDueMinor: number;
    penaltyDueMinor: number;
    totalDueMinor: number;
    status: string;
    paidPrincipalMinor: number;
    paidInterestMinor: number;
    paidPenaltyMinor: number;
  }>;
}

export interface LoanListItem {
  id: string;
  groupId: string;
  borrowerId: string;
  principalAmountMinor: number;
  currencyCode: string;
  state: string;
  termPeriods: number;
  disbursementRecordedAt: Date | null;
  createdAt: Date;
}
