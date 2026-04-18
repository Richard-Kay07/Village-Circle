'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { queryKeys } from '@/lib/api/query-keys';

export function useLoanRuleHints(groupId: string | null, actorMemberId: string | null) {
  return useQuery({
    queryKey: queryKeys.groupRules.loanHints(groupId ?? ''),
    queryFn: () =>
      apiClient.get<{ loanInterestEnabled: boolean; loanInterestRateBps: number }>(
        `group-rules/group/${groupId}/loan-hints`,
        { tenantGroupId: groupId ?? undefined, actorMemberId: actorMemberId ?? undefined }
      ),
    enabled: !!groupId && !!actorMemberId,
  });
}

export function useLedgerBalance(groupId: string | null, bucket: string) {
  return useQuery({
    queryKey: ['ledger', 'balance', groupId, bucket],
    queryFn: () => apiClient.get<{ balance: number }>(`ledger/balance/${groupId}/${bucket}`),
    enabled: !!groupId,
  });
}

export function useLoansByGroup(groupId: string | null, actorMemberId: string | null) {
  return useQuery({
    queryKey: queryKeys.loans.list(groupId ?? ''),
    queryFn: () =>
      apiClient.get<Array<{ id: string; borrowerId: string; principalAmountMinor: number; state: string; totalRepaidMinor: number }>>(
        `loans/group/${groupId}`,
        { tenantGroupId: groupId ?? undefined, actorMemberId: actorMemberId ?? undefined }
      ),
    enabled: !!groupId && !!actorMemberId,
  });
}

export interface LoanRepaymentItem {
  id: string;
  amountMinor: number;
  principalMinor: number;
  interestMinor: number;
  penaltyMinor: number;
  transactionMode: string;
  externalReferenceText: string | null;
  evidencePresence: { hasText: boolean; hasImage: boolean };
  recordedAt: string;
  type: string;
}

export interface LoanScheduleItem {
  installmentNo: number;
  dueDate: string;
  principalDueMinor: number;
  interestDueMinor: number;
  penaltyDueMinor?: number;
  totalDueMinor: number;
  paidPrincipalMinor?: number;
  paidInterestMinor?: number;
  paidPenaltyMinor?: number;
  status: string;
}

export interface LoanExceptionEvents {
  waivers: Array<{ id: string; reason: string; approvedByUserId: string; approvedAt: string; scheduleItemId: string | null; amountMinorWaived: number; waiverType: string | null }>;
  reschedules: Array<{ id: string; reason: string; approvedByUserId: string; approvedAt: string; previousTermPeriods: number | null; newTermPeriods: number | null; firstDueDate: string | null }>;
  writeOffs: Array<{ id: string; reason: string; approvedByUserId: string; approvedAt: string; amountMinorWrittenOff: number | null }>;
}

export function useLoanDetail(loanId: string | null, actorMemberId: string | null) {
  return useQuery({
    queryKey: queryKeys.loans.detail(loanId ?? ''),
    queryFn: () =>
      apiClient.get<{
        id: string;
        groupId: string;
        borrowerId: string;
        principalAmountMinor: number;
        state: string;
        interestEnabledSnapshot: boolean;
        interestRateBpsSnapshot: number;
        interestBasisSnapshot?: string;
        ruleVersionIdSnapshot?: string | null;
        termPeriods: number;
        scheduleItems: LoanScheduleItem[];
        totalRepaidMinor: number;
        repayments?: LoanRepaymentItem[];
        exceptionEvents?: LoanExceptionEvents;
      }>(`loans/${loanId}`, { tenantGroupId: undefined, actorMemberId: actorMemberId ?? undefined }),
    enabled: !!loanId && !!actorMemberId,
  });
}

export function useMemberProfile(memberId: string | null) {
  return useQuery({
    queryKey: queryKeys.members.detail('', memberId ?? ''),
    queryFn: () => apiClient.get<{ id: string; displayName: string; phone: string | null; groupId: string }>(`members/${memberId}`),
    enabled: !!memberId,
  });
}

export interface MemberHistoryResult {
  contributions: Array<{
    id: string;
    tenantGroupId: string;
    savingsAmountMinor: number;
    socialFundAmountMinor: number;
    totalAmountMinor: number;
    recordedAt: string | null;
    evidencePresence?: { hasText: boolean; hasImage: boolean };
  }>;
  totalSavingsMinor: number;
  totalSocialFundMinor: number;
}

export function useContributionHistory(tenantGroupId: string | null, memberId: string | null) {
  return useQuery({
    queryKey: queryKeys.contributions.byMember(tenantGroupId ?? '', memberId ?? ''),
    queryFn: () =>
      apiClient.get<MemberHistoryResult>(`contributions/member/${memberId}/history?tenantGroupId=${tenantGroupId}`, {
        tenantGroupId: tenantGroupId ?? undefined,
        actorMemberId: memberId ?? undefined,
      }),
    enabled: !!tenantGroupId && !!memberId,
  });
}

export function useContributionDetail(contributionId: string | null, tenantGroupId: string | null) {
  return useQuery({
    queryKey: queryKeys.contributions.detail(contributionId ?? ''),
    queryFn: () =>
      apiClient.get<{
        id: string;
        tenantGroupId: string;
        meetingId: string | null;
        memberProfileId: string;
        savingsAmountMinor: number;
        socialFundAmountMinor: number;
        totalAmountMinor: number;
        externalReferenceText: string | null;
        evidenceAttachmentId: string | null;
        status: string;
        ledgerEventId: string | null;
        createdAt: string;
      }>(`contributions/${contributionId}`, { tenantGroupId: tenantGroupId ?? undefined }),
    enabled: !!contributionId && !!tenantGroupId,
  });
}
