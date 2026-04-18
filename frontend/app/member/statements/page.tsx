'use client';

import React, { useState } from 'react';
import { PageHeader, EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui';
import { DateField } from '@/components/forms';
import { formatGBP, formatUKDate } from '@/lib/format';
import { useMemberSession } from '@/lib/member/context';
import { useContributionHistory } from '@/lib/api/hooks/member';
import { getCopy, COPY_KEYS } from '@/lib/copy';

export default function MemberStatementsPage() {
  const session = useMemberSession();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const history = useContributionHistory(session?.groupId ?? null, session?.memberId ?? null);

  if (history.isError) {
    return (
      <>
        <PageHeader title={getCopy(COPY_KEYS.member_statements_title)} backHref="/member" backLabel={getCopy(COPY_KEYS.member_backToDashboard)} />
        <ErrorState message={getCopy(COPY_KEYS.member_statements_errorLoad)} onRetry={() => history.refetch()} />
      </>
    );
  }

  if (history.isLoading) {
    return (
      <>
        <PageHeader title={getCopy(COPY_KEYS.member_statements_title)} backHref="/member" backLabel={getCopy(COPY_KEYS.member_backToDashboard)} />
        <LoadingSkeleton variant="list" lines={6} />
      </>
    );
  }

  const items = history.data?.contributions ?? [];
  const filtered = items.filter((item) => {
    const d = new Date(item.recordedAt ?? 0).getTime();
    if (fromDate && d < new Date(fromDate).getTime()) return false;
    if (toDate && d > new Date(toDate + 'T23:59:59').getTime()) return false;
    return true;
  });

  return (
    <>
      <PageHeader title={getCopy(COPY_KEYS.member_statements_title)} backHref="/member" backLabel={getCopy(COPY_KEYS.member_backToDashboard)} />
      <div style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end' }}>
        <DateField label={getCopy(COPY_KEYS.member_statements_dateFrom)} value={fromDate} onChange={setFromDate} />
        <DateField label={getCopy(COPY_KEYS.member_statements_dateTo)} value={toDate} onChange={setToDate} />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <button type="button" disabled style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: 0.7, cursor: 'not-allowed' }}>
          {getCopy(COPY_KEYS.member_statements_exportUnavailable)}
        </button>
        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>{getCopy(COPY_KEYS.member_statements_exportUnavailableHint)}</p>
      </div>
      <section>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>{getCopy(COPY_KEYS.member_statements_entriesByBucket)}</h3>
        {filtered.length === 0 ? (
          <EmptyState title={getCopy(COPY_KEYS.member_statements_noEntries)} description={getCopy(COPY_KEYS.member_statements_emptyDescription)} />
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {filtered.map((item) => (
              <li key={item.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid #e5e7eb' }}>
                <a href={`/member/transactions/${item.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 500 }}>{getCopy(COPY_KEYS.save_contribution_recordType)}</span>
                    <span style={{ fontWeight: 600 }}>{formatGBP(item.totalAmountMinor)}</span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
                    {formatUKDate(item.recordedAt ?? '')} · {getCopy(COPY_KEYS.save_bucket_savings)} {formatGBP(item.savingsAmountMinor)} · {getCopy(COPY_KEYS.save_bucket_socialFund)} {formatGBP(item.socialFundAmountMinor)}
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
