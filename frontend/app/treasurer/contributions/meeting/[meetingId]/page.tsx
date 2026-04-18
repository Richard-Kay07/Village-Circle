'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PageHeader, EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui';
import { formatGBP } from '@/lib/format/currency';
import { useTreasurerGroupId, useMeetingSummary, useReversalContribution } from '@/lib/api/hooks/treasurer';
import { useCapabilities } from '@/lib/context/capabilities-context';
import { getCopy, COPY_KEYS } from '@/lib/copy';

export default function TreasurerMeetingDetailPage({ params }: { params: { meetingId: string } }) {
  const searchParams = useSearchParams();
  const success = searchParams.get('success') === '1';
  const groupId = useTreasurerGroupId();
  const meetingId = params.meetingId;
  const summary = useMeetingSummary(meetingId, groupId);
  const reversal = useReversalContribution(groupId);
  const canReverse = useCapabilities().includes('contribution.reverse');

  const [reversalId, setReversalId] = useState<string | null>(null);
  const [reversalReason, setReversalReason] = useState('');

  const handleReverseClick = (contributionId: string) => {
    setReversalId(contributionId);
    setReversalReason('');
  };

  const handleReversalConfirm = async () => {
    if (!reversalId || !reversalReason.trim()) return;
    try {
      await reversal.mutateAsync({ contributionId: reversalId, reversalReason: reversalReason.trim() });
      setReversalId(null);
      setReversalReason('');
      summary.refetch();
    } catch {
      // Error from mutation
    }
  };

  if (summary.isError) {
    return (
      <>
        <PageHeader title={getCopy(COPY_KEYS.ops_meeting_detail_title)} backHref="/treasurer/contributions/meeting" backLabel={getCopy(COPY_KEYS.ops_meeting_entry_backToMeetings)} />
        <ErrorState message={getCopy(COPY_KEYS.ops_meeting_detail_errorLoad)} onRetry={() => summary.refetch()} />
      </>
    );
  }

  if (summary.isLoading || !summary.data) {
    return (
      <>
        <PageHeader title={getCopy(COPY_KEYS.ops_meeting_detail_title)} backHref="/treasurer/contributions/meeting" backLabel={getCopy(COPY_KEYS.ops_meeting_entry_backToMeetings)} />
        <LoadingSkeleton variant="card" />
      </>
    );
  }

  const data = summary.data;
  const contributions = data.contributions ?? [];

  return (
    <>
      <PageHeader title={getCopy(COPY_KEYS.ops_meeting_detail_title)} backHref="/treasurer/contributions/meeting" backLabel={getCopy(COPY_KEYS.ops_meeting_entry_backToMeetings)} />
      {success && (
        <div role="status" style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '8px', fontSize: '0.875rem' }}>
          {getCopy(COPY_KEYS.save_contribution_success)}
        </div>
      )}
      <p style={{ marginBottom: '1rem' }}>
        <Link href={`/treasurer/contributions/meeting/${meetingId}/entry`} style={{ fontSize: '0.875rem', color: '#2563eb' }}>{getCopy(COPY_KEYS.ops_meeting_detail_addMoreEntries)}</Link>
      </p>
      <section style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{getCopy(COPY_KEYS.ops_meeting_detail_totalsHeading)}</h3>
        <p style={{ margin: '0.25rem 0' }}><strong>{getCopy(COPY_KEYS.save_batch_savingsTotal)}:</strong> {formatGBP(data.totalSavingsMinor)}</p>
        <p style={{ margin: '0.25rem 0' }}><strong>{getCopy(COPY_KEYS.save_batch_socialFundTotal)}:</strong> {formatGBP(data.totalSocialFundMinor)}</p>
        <p style={{ margin: '0.25rem 0' }}><strong>{getCopy(COPY_KEYS.save_batch_totalCollected)}:</strong> {formatGBP(data.totalAmountMinor)}</p>
        <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
          {getCopy(COPY_KEYS.save_batch_cashCount)}: {data.byMode?.CASH?.count ?? 0} · {getCopy(COPY_KEYS.save_batch_bankCount)}: {data.byMode?.BANK_TRANSFER?.count ?? 0}
        </p>
      </section>
      <section>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Contributions</h3>
        {contributions.length === 0 ? (
          <EmptyState title="No contributions" description="Record contributions via the entry screen." />
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {contributions.map((c) => (
              <li key={c.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontWeight: 500 }}>{formatGBP(c.savingsAmountMinor + c.socialFundAmountMinor)}</span>
                    <span style={{ fontSize: '0.8125rem', color: '#6b7280', display: 'block' }}>{c.transactionMode ?? '—'}</span>
                  </div>
                  {canReverse && (
                    <button
                      type="button"
                      onClick={() => handleReverseClick(c.id)}
                      disabled={reversal.isPending}
                      style={{ fontSize: '0.8125rem', color: '#dc2626', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                    >
                      Reverse
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {reversalId && (
        <div role="dialog" aria-labelledby="reversal-title" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '1.5rem', maxWidth: '22rem', width: '100%' }}>
            <h2 id="reversal-title" style={{ margin: '0 0 0.5rem', fontSize: '1.125rem', fontWeight: 600 }}>Reverse contribution</h2>
            <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: '#4b5563' }}>
              Reversing creates a reversing ledger entry and an audit record. This cannot be undone.
            </p>
            <label htmlFor="reversal-reason" style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Reason (required)</label>
            <textarea
              id="reversal-reason"
              value={reversalReason}
              onChange={(e) => setReversalReason(e.target.value)}
              placeholder="e.g. Duplicate entry"
              rows={2}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '1rem' }}
            />
            {reversal.isError && <p style={{ fontSize: '0.8125rem', color: '#dc2626', marginBottom: '0.5rem' }}>{(reversal.error as Error)?.message}</p>}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => { setReversalId(null); setReversalReason(''); }} disabled={reversal.isPending} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={handleReversalConfirm} disabled={!reversalReason.trim() || reversal.isPending} style={{ padding: '0.5rem 1rem', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Reverse</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
