'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { queryKeys } from '@/lib/api/query-keys';

export interface EvidenceMetadata {
  id: string;
  groupId: string;
  storedPath: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

export function useEvidenceMetadata(evidenceId: string | null, actorMemberId: string | null) {
  return useQuery({
    queryKey: queryKeys.evidence.detail(evidenceId ?? ''),
    queryFn: () =>
      apiClient.get<EvidenceMetadata>(`evidence/${evidenceId}?actorMemberId=${encodeURIComponent(actorMemberId!)}`),
    enabled: !!evidenceId && !!actorMemberId,
  });
}
