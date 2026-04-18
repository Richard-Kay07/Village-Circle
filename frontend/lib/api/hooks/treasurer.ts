'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { queryKeys } from '@/lib/api/query-keys';

const DEMO_GROUP_ID = process.env.NEXT_PUBLIC_DEMO_GROUP_ID ?? 'demo-group';
const DEMO_USER_ID = process.env.NEXT_PUBLIC_DEMO_USER_ID ?? 'demo-user';

export function useTreasurerGroupId(): string {
  return DEMO_GROUP_ID;
}

export function useMeetingsByGroup(groupId: string | null) {
  return useQuery({
    queryKey: queryKeys.meetings.list(groupId ?? ''),
    queryFn: () =>
      apiClient.get<Array<{ id: string; groupId: string; heldAt: string; name: string | null }>>(
        `meetings/group/${groupId}`,
        { tenantGroupId: groupId ?? undefined }
      ),
    enabled: !!groupId,
  });
}

export function useCreateMeeting(groupId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: { heldAt: string; name?: string }) =>
      apiClient.post<{ id: string }>('meetings', {
        tenantGroupId: groupId,
        heldAt: payload.heldAt,
        name: payload.name,
        createdByUserId: DEMO_USER_ID,
      }, { tenantGroupId: groupId }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.meetings.list(groupId) });
    },
  });
}

export function useMembersByGroup(groupId: string | null) {
  return useQuery({
    queryKey: queryKeys.members.list(groupId ?? ''),
    queryFn: () =>
      apiClient.get<Array<{ id: string; displayName: string }>>(`members/group/${groupId}`, {
        tenantGroupId: groupId ?? undefined,
      }),
    enabled: !!groupId,
  });
}

export interface MeetingSummaryResult {
  meetingId: string;
  totalSavingsMinor: number;
  totalSocialFundMinor: number;
  totalAmountMinor: number;
  byMode: { CASH: { count: number }; BANK_TRANSFER: { count: number } };
  contributions: Array<{ id: string; memberProfileId: string; savingsAmountMinor: number; socialFundAmountMinor: number; transactionMode: string | null }>;
}

export function useMeetingSummary(meetingId: string | null, tenantGroupId: string | null) {
  return useQuery({
    queryKey: [...queryKeys.contributions.byMeeting(tenantGroupId ?? '', meetingId ?? ''), 'summary'],
    queryFn: () =>
      apiClient.get<MeetingSummaryResult>(`contributions/meeting/${meetingId}/summary?tenantGroupId=${tenantGroupId}`, {
        tenantGroupId: tenantGroupId ?? undefined,
      }),
    enabled: !!meetingId && !!tenantGroupId,
  });
}

export interface BulkContributionItem {
  memberProfileId: string;
  transactionMode: 'CASH' | 'BANK_TRANSFER';
  savingsAmountMinor: number;
  socialFundAmountMinor: number;
  externalReferenceText?: string;
  evidenceAttachmentId?: string;
  idempotencyKey: string;
}

export function useRecordBulkContributions(groupId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: { meetingId: string; contributions: BulkContributionItem[] }) =>
      apiClient.post<{ recorded: number; ids: string[] }>('contributions/bulk', {
        tenantGroupId: groupId,
        meetingId: payload.meetingId,
        contributions: payload.contributions,
        recordedByUserId: DEMO_USER_ID,
      }, { tenantGroupId: groupId }),
    onSuccess: (_, { meetingId }) => {
      client.invalidateQueries({ queryKey: queryKeys.contributions.byMeeting(groupId, meetingId) });
      client.invalidateQueries({ queryKey: queryKeys.contributions.list(groupId) });
    },
  });
}

export function useReversalContribution(groupId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: { contributionId: string; reversalReason: string }) =>
      apiClient.post<{ id: string; createdAt: string }>('contributions/reversal', {
        tenantGroupId: groupId,
        contributionId: payload.contributionId,
        reversalReason: payload.reversalReason,
        reversedByUserId: DEMO_USER_ID,
      }, { tenantGroupId: groupId }),
    onSuccess: (_, { contributionId }) => {
      client.invalidateQueries({ queryKey: queryKeys.contributions.list(groupId) });
      client.invalidateQueries({ queryKey: queryKeys.contributions.detail(contributionId) });
      client.invalidateQueries({ queryKey: queryKeys.contributions.all });
    },
  });
}

export interface ContributionListFilters {
  dateFrom?: string;
  dateTo?: string;
  meetingId?: string;
  memberId?: string;
  transactionMode?: 'CASH' | 'BANK_TRANSFER';
  fundBucket?: 'SAVINGS' | 'SOCIAL_FUND';
  status?: 'RECORDED' | 'REVERSED';
}

export interface GroupContributionListResult {
  contributions: Array<{
    id: string;
    tenantGroupId: string;
    meetingId: string | null;
    memberProfileId: string;
    transactionMode: string | null;
    savingsAmountMinor: number;
    socialFundAmountMinor: number;
    totalAmountMinor: number;
    externalReferenceText?: string | null;
    evidencePresence: { hasText: boolean; hasImage: boolean; evidenceAttachmentId: string | null };
    ledgerEventId: string | null;
    status: string;
    recordedAt: string | null;
    createdAt: string;
  }>;
  totalSavingsMinor: number;
  totalSocialFundMinor: number;
  totalAmountMinor: number;
  byMode: {
    CASH: { count: number; savingsMinor: number; socialFundMinor: number };
    BANK_TRANSFER: { count: number; savingsMinor: number; socialFundMinor: number };
  };
}

const DEMO_MEMBER_ID = process.env.NEXT_PUBLIC_DEMO_MEMBER_ID ?? 'demo-member';

export function useContributionListByGroup(groupId: string | null, filters: ContributionListFilters) {
  const params = new URLSearchParams();
  if (groupId) params.set('tenantGroupId', groupId);
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);
  if (filters.meetingId) params.set('meetingId', filters.meetingId);
  if (filters.memberId) params.set('memberId', filters.memberId);
  if (filters.transactionMode) params.set('transactionMode', filters.transactionMode);
  if (filters.fundBucket) params.set('fundBucket', filters.fundBucket);
  if (filters.status) params.set('status', filters.status);
  params.set('actorMemberId', DEMO_MEMBER_ID);

  return useQuery({
    queryKey: queryKeys.contributions.listWithFilters(groupId ?? '', filters),
    queryFn: () =>
      apiClient.get<GroupContributionListResult>(
        `contributions/group/${groupId}/history?${params.toString()}`,
        { tenantGroupId: groupId ?? undefined, actorMemberId: DEMO_MEMBER_ID }
      ),
    enabled: !!groupId,
  });
}

export interface ContributionDetailResult {
  id: string;
  tenantGroupId: string;
  meetingId: string | null;
  memberProfileId: string;
  transactionMode: string | null;
  savingsAmountMinor: number;
  socialFundAmountMinor: number;
  totalAmountMinor: number;
  externalReferenceText: string | null;
  evidenceAttachmentId: string | null;
  status: string;
  recordedByUserId: string | null;
  recordedAt: Date | null;
  reversedByUserId: string | null;
  reversedAt: Date | null;
  reversalReason: string | null;
  ledgerEventId: string | null;
  idempotencyKey: string | null;
  createdAt: string;
}

export function useContributionDetailTreasurer(contributionId: string | null, groupId: string | null) {
  return useQuery({
    queryKey: queryKeys.contributions.detail(contributionId ?? ''),
    queryFn: () =>
      apiClient.get<ContributionDetailResult>(`contributions/${contributionId}?tenantGroupId=${groupId}`, {
        tenantGroupId: groupId ?? undefined,
      }),
    enabled: !!contributionId && !!groupId,
  });
}

// --- Loan applications (Treasurer/Chair) ---

export interface LoanApplicationListItem {
  id: string;
  memberId: string;
  memberDisplayName: string;
  requestedAmountMinor: number;
  requestedTermPeriods: number;
  purpose: string | null;
  status: string;
  submittedAt: string;
  eligibilityHint: string | null;
  riskFlags: string[] | null;
}

export function useLoanApplicationsByGroup(
  groupId: string | null,
  status?: 'SUBMITTED' | 'APPROVED' | 'REJECTED'
) {
  const params = new URLSearchParams();
  if (groupId) params.set('tenantGroupId', groupId);
  if (status) params.set('status', status);
  params.set('actorMemberId', DEMO_MEMBER_ID);
  return useQuery({
    queryKey: queryKeys.loans.applications(groupId ?? '', status),
    queryFn: () =>
      apiClient.get<LoanApplicationListItem[]>(
        `loans/applications/group/${groupId}?${params.toString()}`,
        { tenantGroupId: groupId ?? undefined, actorMemberId: DEMO_MEMBER_ID }
      ),
    enabled: !!groupId,
  });
}

export interface LoanApplicationDetailResult {
  id: string;
  groupId: string;
  memberId: string;
  requestedAmountMinor: number;
  requestedTermPeriods: number;
  purpose: string | null;
  status: string;
  submittedAt: string;
  submittedByUserId: string;
  member: { id: string; displayName: string };
  ruleSnapshot: {
    loanInterestEnabled: boolean;
    loanInterestRateBps: number;
    loanInterestBasis: string;
  } | null;
}

export function useLoanApplicationDetail(applicationId: string | null, groupId: string | null) {
  return useQuery({
    queryKey: queryKeys.loans.applicationDetail(applicationId ?? ''),
    queryFn: () =>
      apiClient.get<LoanApplicationDetailResult>(
        `loans/applications/${applicationId}?tenantGroupId=${groupId}`,
        { tenantGroupId: groupId ?? undefined, actorMemberId: DEMO_MEMBER_ID }
      ),
    enabled: !!applicationId && !!groupId,
  });
}

export function useApproveLoanApplication(groupId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (applicationId: string) =>
      apiClient.post<{ loanId: string }>('loans/applications/approve', {
        applicationId,
        tenantGroupId: groupId,
        approvedByUserId: DEMO_USER_ID,
        actorMemberId: DEMO_MEMBER_ID,
      }, { tenantGroupId: groupId, actorMemberId: DEMO_MEMBER_ID }),
    onSuccess: (_, applicationId) => {
      client.invalidateQueries({ queryKey: queryKeys.loans.applications(groupId, 'SUBMITTED') });
      client.invalidateQueries({ queryKey: queryKeys.loans.applicationDetail(applicationId) });
      client.invalidateQueries({ queryKey: queryKeys.loans.all });
    },
  });
}

export function useRejectLoanApplication(groupId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (applicationId: string) =>
      apiClient.post(
        `loans/applications/${applicationId}/reject?tenantGroupId=${encodeURIComponent(groupId)}&rejectedByUserId=${encodeURIComponent(DEMO_USER_ID)}`,
        undefined,
        { tenantGroupId: groupId, actorMemberId: DEMO_MEMBER_ID }
      ),
    onSuccess: (_, applicationId) => {
      client.invalidateQueries({ queryKey: queryKeys.loans.applications(groupId, 'SUBMITTED') });
      client.invalidateQueries({ queryKey: queryKeys.loans.applicationDetail(applicationId) });
      client.invalidateQueries({ queryKey: queryKeys.loans.all });
    },
  });
}

// --- Loan list (for Treasurer active loans) ---

export function useLoansByGroupTreasurer(groupId: string | null) {
  return useQuery({
    queryKey: queryKeys.loans.list(groupId ?? ''),
    queryFn: () =>
      apiClient.get<Array<{ id: string; borrowerId: string; principalAmountMinor: number; state: string; totalRepaidMinor: number }>>(
        `loans/group/${groupId}`,
        { tenantGroupId: groupId ?? undefined, actorMemberId: DEMO_MEMBER_ID }
      ),
    enabled: !!groupId,
  });
}

// --- Loan repayment (Treasurer/Chair) ---

export interface RecordRepaymentPayload {
  loanId: string;
  tenantGroupId: string;
  amountMinor: number;
  transactionMode: 'CASH' | 'BANK_TRANSFER';
  externalReferenceText?: string;
  evidenceAttachmentId?: string;
  idempotencyKey: string;
}

export interface RecordRepaymentResult {
  id: string;
  createdAt: string;
  allocation?: { principalMinor: number; interestMinor: number; penaltyMinor: number };
}

export function useRecordLoanRepayment(groupId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: RecordRepaymentPayload) =>
      apiClient.post<RecordRepaymentResult>('loans/repayments', {
        loanId: payload.loanId,
        tenantGroupId: payload.tenantGroupId,
        amountMinor: payload.amountMinor,
        transactionMode: payload.transactionMode,
        externalReferenceText: payload.externalReferenceText || undefined,
        evidenceAttachmentId: payload.evidenceAttachmentId || undefined,
        recordedByUserId: DEMO_USER_ID,
        idempotencyKey: payload.idempotencyKey,
        actorMemberId: DEMO_MEMBER_ID,
      }, { tenantGroupId: groupId, actorMemberId: DEMO_MEMBER_ID }),
    onSuccess: (_, variables) => {
      client.invalidateQueries({ queryKey: queryKeys.loans.detail(variables.loanId) });
      client.invalidateQueries({ queryKey: queryKeys.loans.list(groupId) });
      client.invalidateQueries({ queryKey: queryKeys.loans.all });
    },
  });
}

export function useRecordWaiver(groupId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: { loanId: string; reason: string; amountMinorWaived?: number; scheduleItemId?: string; waiverType?: string }) =>
      apiClient.post<{ id: string }>('loans/waivers', {
        loanId: payload.loanId,
        tenantGroupId: groupId,
        reason: payload.reason,
        approvedByUserId: DEMO_USER_ID,
        amountMinorWaived: payload.amountMinorWaived ?? 0,
        scheduleItemId: payload.scheduleItemId,
        waiverType: payload.waiverType,
        actorMemberId: DEMO_MEMBER_ID,
      }, { tenantGroupId: groupId, actorMemberId: DEMO_MEMBER_ID }),
    onSuccess: (_, variables) => {
      client.invalidateQueries({ queryKey: queryKeys.loans.detail(variables.loanId) });
      client.invalidateQueries({ queryKey: queryKeys.loans.all });
    },
  });
}

export function useRecordReschedule(groupId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: { loanId: string; reason: string; newTermPeriods: number; firstDueDate: string }) =>
      apiClient.post<{ id: string }>('loans/reschedules', {
        loanId: payload.loanId,
        tenantGroupId: groupId,
        reason: payload.reason,
        approvedByUserId: DEMO_USER_ID,
        newTermPeriods: payload.newTermPeriods,
        firstDueDate: payload.firstDueDate,
        actorMemberId: DEMO_MEMBER_ID,
      }, { tenantGroupId: groupId, actorMemberId: DEMO_MEMBER_ID }),
    onSuccess: (_, variables) => {
      client.invalidateQueries({ queryKey: queryKeys.loans.detail(variables.loanId) });
      client.invalidateQueries({ queryKey: queryKeys.loans.all });
    },
  });
}

export function useRecordWriteOff(groupId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: { loanId: string; reason: string }) =>
      apiClient.post<{ id: string }>('loans/write-offs', {
        loanId: payload.loanId,
        tenantGroupId: groupId,
        reason: payload.reason,
        approvedByUserId: DEMO_USER_ID,
        actorMemberId: DEMO_MEMBER_ID,
      }, { tenantGroupId: groupId, actorMemberId: DEMO_MEMBER_ID }),
    onSuccess: (_, variables) => {
      client.invalidateQueries({ queryKey: queryKeys.loans.detail(variables.loanId) });
      client.invalidateQueries({ queryKey: queryKeys.loans.all });
    },
  });
}
