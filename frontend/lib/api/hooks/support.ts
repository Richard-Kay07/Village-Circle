'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { queryKeys } from '@/lib/api/query-keys';
import type { SupportAccessState } from '@/lib/support/types';

export interface AuditLogFilters {
  entityType?: string;
  entityId?: string;
  action?: string;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  cursor?: string;
}

export interface AuditLogEntry {
  id: string;
  tenantGroupId: string | null;
  actorUserId: string | null;
  channel: string;
  action: string;
  entityType: string;
  entityId: string;
  reasonCode: string | null;
  sequenceNo: number;
  createdAt: string;
}

export interface AuditLogResult {
  items: AuditLogEntry[];
  nextCursor: string | null;
}

export interface SmsFailureEntry {
  id: string;
  tenantGroupId: string;
  recipientMemberId: string | null;
  templateKey: string;
  status: string;
  errorCode: string | null;
  errorMessage: string | null;
  retryCount: number;
  createdAt: string;
}

export interface SmsFailuresResult {
  items: SmsFailureEntry[];
  nextCursor: string | null;
}

export interface ContributionTrace {
  entityType: 'CONTRIBUTION';
  entity: Record<string, unknown>;
  auditEvents: Array<{ id: string; action: string; entityType: string; entityId: string; sequenceNo: number; createdAt: string }>;
  ledgerEvents: Array<{ id: string; sourceEventType: string; sourceEventId: string; eventTimestamp: string }>;
  ledgerLines: Array<{ ledgerEventId: string; fundBucket: string; memberId: string | null; amountMinor: number }>;
  evidenceMetadata: Array<{ id: string; storedPath: string; mimeType: string; sizeBytes: number }>;
  notifications: Array<{ id: string; channel: string; templateKey: string; status: string; createdAt: string }>;
}

export interface LoanTrace {
  entityType: 'LOAN';
  entity: Record<string, unknown>;
  scheduleItems: Array<Record<string, unknown>>;
  repayments: Array<Record<string, unknown>>;
  auditEvents: Array<{ id: string; action: string; entityType: string; entityId: string; sequenceNo: number; createdAt: string }>;
  ledgerEvents: Array<{ id: string; sourceEventType: string; sourceEventId: string; eventTimestamp: string }>;
  ledgerLines: Array<{ ledgerEventId: string; fundBucket: string; memberId: string | null; amountMinor: number }>;
  evidenceMetadata: Array<{ id: string; storedPath: string; mimeType: string; sizeBytes: number }>;
  notifications: Array<{ id: string; channel: string; templateKey: string; status: string; createdAt: string }>;
}

export type EntityTrace = ContributionTrace | LoanTrace;

function supportConfig(state: SupportAccessState | null): { tenantGroupId?: string; actorUserId?: string } {
  if (!state) return {};
  return { tenantGroupId: state.tenantGroupId, actorUserId: state.actorUserId };
}

export function useSupportAuditLog(
  state: SupportAccessState | null,
  filters: AuditLogFilters & { tenantGroupId: string }
) {
  const enabled = !!state && !!filters.tenantGroupId;
  return useQuery({
    queryKey: queryKeys.support.auditLog(filters.tenantGroupId, filters),
    queryFn: () =>
      apiClient.post<AuditLogResult>('support/audit-log', {
        supportCaseOrIncidentId: state!.supportCaseOrIncidentId,
        reasonCode: state!.reasonCode,
        actorUserId: state!.actorUserId,
        tenantGroupId: filters.tenantGroupId,
        entityType: filters.entityType,
        entityId: filters.entityId,
        action: filters.action,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        limit: filters.limit ?? 50,
        cursor: filters.cursor,
      }, supportConfig(state!)),
    enabled,
  });
}

export function useSupportSmsFailures(
  state: SupportAccessState | null,
  options: { tenantGroupId?: string; limit?: number; cursor?: string } = {}
) {
  const enabled = !!state;
  return useQuery({
    queryKey: queryKeys.support.smsFailures(options.tenantGroupId ?? '', options.cursor),
    queryFn: () =>
      apiClient.post<SmsFailuresResult>('support/sms-failures', {
        supportCaseOrIncidentId: state!.supportCaseOrIncidentId,
        reasonCode: state!.reasonCode,
        actorUserId: state!.actorUserId,
        tenantGroupId: options.tenantGroupId,
        limit: options.limit ?? 50,
        cursor: options.cursor,
      }, supportConfig(state!)),
    enabled,
  });
}

function traceUrl(
  type: 'contribution' | 'loan',
  id: string,
  state: SupportAccessState,
  tenantGroupId: string
): string {
  const params = new URLSearchParams({
    reasonCode: state.reasonCode,
    supportCaseOrIncidentId: state.supportCaseOrIncidentId,
    actorUserId: state.actorUserId,
    tenantGroupId,
  });
  return `support/trace/${type}/${id}?${params.toString()}`;
}

export function useContributionTrace(
  state: SupportAccessState | null,
  contributionId: string | null,
  tenantGroupId: string
) {
  const enabled = !!state && !!contributionId && !!tenantGroupId;
  return useQuery({
    queryKey: queryKeys.support.trace('CONTRIBUTION', contributionId ?? '', tenantGroupId),
    queryFn: () =>
      apiClient.get<ContributionTrace>(
        traceUrl('contribution', contributionId!, state!, tenantGroupId),
        supportConfig(state!)
      ),
    enabled,
  });
}

export function useLoanTrace(
  state: SupportAccessState | null,
  loanId: string | null,
  tenantGroupId: string
) {
  const enabled = !!state && !!loanId && !!tenantGroupId;
  return useQuery({
    queryKey: queryKeys.support.trace('LOAN', loanId ?? '', tenantGroupId),
    queryFn: () =>
      apiClient.get<LoanTrace>(
        traceUrl('loan', loanId!, state!, tenantGroupId),
        supportConfig(state!)
      ),
    enabled,
  });
}

export function useSupportEvidence(state: SupportAccessState | null, evidenceId: string | null) {
  const enabled = !!state && !!evidenceId;
  return useQuery({
    queryKey: queryKeys.support.evidence(evidenceId ?? ''),
    queryFn: () => {
      const params = new URLSearchParams({
        reasonCode: state!.reasonCode,
        supportCaseOrIncidentId: state!.supportCaseOrIncidentId,
        actorUserId: state!.actorUserId,
        tenantGroupId: state!.tenantGroupId,
      });
      return apiClient.get<{ id: string; mimeType?: string; sizeBytes?: number; storedPath?: string; createdAt?: string | null }>(
        `evidence/${evidenceId}/support?${params.toString()}`,
        supportConfig(state!)
      );
    },
    enabled,
  });
}

export function useRetryNotification(state: SupportAccessState | null) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!state) throw new Error('Support access required');
      return apiClient.post<{ status: string }>(`support/notifications/${notificationId}/retry`, {
        supportCaseOrIncidentId: state.supportCaseOrIncidentId,
        reasonCode: state.reasonCode,
        actorUserId: state.actorUserId,
        tenantGroupId: state.tenantGroupId,
      }, supportConfig(state));
    },
    onSuccess: (_, _id, ctx) => {
      client.invalidateQueries({ queryKey: queryKeys.support.all });
    },
  });
}
