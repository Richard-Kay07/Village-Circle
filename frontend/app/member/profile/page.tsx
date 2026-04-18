'use client';

import React from 'react';
import { PageHeader, EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui';
import { useMemberSession } from '@/lib/member/context';
import { useMemberProfile } from '@/lib/api/hooks/member';
import { apiClient } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api/query-keys';

export default function MemberProfilePage() {
  const session = useMemberSession();
  const profile = useMemberProfile(session?.memberId ?? null);
  const groupMembers = useQuery({
    queryKey: queryKeys.members.list(session?.groupId ?? ''),
    queryFn: () =>
      apiClient.get<Array<{ id: string; displayName: string }>>(`members/group/${session?.groupId}`, {
        tenantGroupId: session?.groupId ?? undefined,
      }),
    enabled: !!session?.groupId,
  });

  if (profile.isError) {
    return (
      <>
        <PageHeader title="Profile" />
        <ErrorState message="Could not load profile." onRetry={() => profile.refetch()} />
      </>
    );
  }

  if (profile.isLoading || !profile.data) {
    return (
      <>
        <PageHeader title="Profile" />
        <LoadingSkeleton variant="card" />
      </>
    );
  }

  const p = profile.data;
  const memberCount = groupMembers.data?.length ?? 0;

  return (
    <>
      <PageHeader title="Profile" />
      <section style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#6b7280' }}>Contact</h3>
        <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Name</span>
            <div style={{ fontWeight: 500 }}>{p.displayName ?? '—'}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Phone</span>
            <div style={{ fontWeight: 500 }}>{p.phone ?? '—'}</div>
          </div>
        </div>
      </section>
      <section>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#6b7280' }}>Group</h3>
        <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <p style={{ fontSize: '0.875rem', margin: 0 }}>
            You are a member of this circle. {memberCount > 0 ? `Group has ${memberCount} member(s).` : 'Group membership summary will appear when available.'}
          </p>
        </div>
      </section>
    </>
  );
}
