'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader, EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui';
import { formatUKDate } from '@/lib/format/date';
import { useTreasurerGroupId, useMeetingsByGroup, useCreateMeeting } from '@/lib/api/hooks/treasurer';
import { getCopy, COPY_KEYS } from '@/lib/copy';

export default function TreasurerMeetingSelectPage() {
  const router = useRouter();
  const groupId = useTreasurerGroupId();
  const meetings = useMeetingsByGroup(groupId);
  const createMeeting = useCreateMeeting(groupId);
  const [newHeldAt, setNewHeldAt] = useState('');
  const [newName, setNewName] = useState('');

  const handleCreate = async () => {
    if (!newHeldAt.trim()) return;
    const heldAt = new Date(newHeldAt).toISOString();
    try {
      const { id } = await createMeeting.mutateAsync({ heldAt, name: newName.trim() || undefined });
      router.push(`/treasurer/contributions/meeting/${id}/entry`);
    } catch {
      // Error shown by mutation
    }
  };

  if (meetings.isError) {
    return (
      <>
        <PageHeader title={getCopy(COPY_KEYS.ops_meeting_entry_title)} backHref="/treasurer/contributions" backLabel={getCopy(COPY_KEYS.hub_backToContributions)} />
        <ErrorState message={getCopy(COPY_KEYS.hub_errorLoadMeetings)} onRetry={() => meetings.refetch()} />
      </>
    );
  }

  if (meetings.isLoading) {
    return (
      <>
        <PageHeader title={getCopy(COPY_KEYS.ops_meeting_entry_title)} backHref="/treasurer/contributions" backLabel={getCopy(COPY_KEYS.hub_backToContributions)} />
        <LoadingSkeleton variant="list" lines={4} />
      </>
    );
  }

  const list = meetings.data ?? [];

  return (
    <>
      <PageHeader title={getCopy(COPY_KEYS.ops_meeting_entry_title)} backHref="/treasurer/contributions" backLabel={getCopy(COPY_KEYS.hub_backToContributions)} />
      <section style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{getCopy(COPY_KEYS.hub_meeting_selectOrCreate)}</h3>
        {list.length === 0 ? (
          <EmptyState title={getCopy(COPY_KEYS.hub_meeting_noMeetingsTitle)} description={getCopy(COPY_KEYS.hub_meeting_noMeetingsDescription)} />
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {list.map((m) => (
              <li key={m.id} style={{ marginBottom: '0.5rem' }}>
                <Link
                  href={`/treasurer/contributions/meeting/${m.id}/entry`}
                  style={{
                    display: 'block',
                    padding: '0.75rem 1rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <span style={{ fontWeight: 500 }}>{m.name || formatUKDate(m.heldAt)}</span>
                  <span style={{ fontSize: '0.8125rem', color: '#6b7280', display: 'block' }}>{formatUKDate(m.heldAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{getCopy(COPY_KEYS.hub_meeting_newMeeting)}</h3>
        <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div>
            <label htmlFor="new-held" style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>{getCopy(COPY_KEYS.hub_meeting_dateLabel)}</label>
            <input
              id="new-held"
              type="datetime-local"
              value={newHeldAt}
              onChange={(e) => setNewHeldAt(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
          </div>
          <div>
            <label htmlFor="new-name" style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>{getCopy(COPY_KEYS.hub_meeting_nameLabel)}</label>
            <input
              id="new-name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={getCopy(COPY_KEYS.hub_meeting_namePlaceholder)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
          </div>
        </div>
        {createMeeting.isError && (
          <p style={{ fontSize: '0.875rem', color: '#dc2626', marginBottom: '0.5rem' }}>{(createMeeting.error as Error)?.message}</p>
        )}
        <button
          type="button"
          onClick={handleCreate}
          disabled={!newHeldAt.trim() || createMeeting.isPending}
          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}
        >
          {createMeeting.isPending ? getCopy(COPY_KEYS.hub_meeting_creating) : getCopy(COPY_KEYS.hub_meeting_createAndEnter)}
        </button>
      </section>
    </>
  );
}
