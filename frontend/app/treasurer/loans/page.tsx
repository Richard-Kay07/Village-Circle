'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { PageHeader, EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui';
import { formatGBP } from '@/lib/format/currency';
import { formatUKDate } from '@/lib/format/date';
import { useTreasurerGroupId, useLoanApplicationsByGroup } from '@/lib/api/hooks/treasurer';

const STATUS_OPTIONS = ['SUBMITTED', 'APPROVED', 'REJECTED'] as const;

export default function TreasurerLoansPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const groupId = useTreasurerGroupId();
  const statusParam = searchParams.get('status') as 'SUBMITTED' | 'APPROVED' | 'REJECTED' | null;
  const status = statusParam && STATUS_OPTIONS.includes(statusParam) ? statusParam : undefined;

  const list = useLoanApplicationsByGroup(groupId, status);

  const setStatus = (newStatus: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | '') => {
    const next = new URLSearchParams(searchParams.toString());
    if (newStatus) next.set('status', newStatus);
    else next.delete('status');
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  if (list.isError) {
    return (
      <>
        <PageHeader title="Loans" backHref="/treasurer" backLabel="Back to Dashboard" />
        <ErrorState message="Could not load loan applications." onRetry={() => list.refetch()} />
      </>
    );
  }

  const applications = list.data ?? [];

  return (
    <>
      <PageHeader title="Loans" backHref="/treasurer" backLabel="Back to Dashboard" />
      <p style={{ marginBottom: '1rem' }}>
        <Link href="/treasurer/loans/active" style={{ fontSize: '0.875rem', color: '#2563eb', fontWeight: 500 }}>
          View active loans
        </Link>
      </p>

      <section style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Queue</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <label style={{ fontSize: '0.8125rem' }}>
            Status
            <select
              value={status ?? ''}
              onChange={(e) => setStatus((e.target.value as 'SUBMITTED' | 'APPROVED' | 'REJECTED') || '')}
              style={{ display: 'block', marginTop: '0.25rem', padding: '0.35rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            >
              <option value="">Pending only</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </label>
        </div>
      </section>

      {list.isLoading ? (
        <LoadingSkeleton variant="list" lines={5} />
      ) : applications.length === 0 ? (
        <EmptyState title="No loan applications" description="Approve and manage loans here. Members submit applications from My Loans." />
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {applications.map((app) => (
            <li key={app.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid #e5e7eb' }}>
              <Link
                href={`/treasurer/loans/application/${app.id}`}
                style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontWeight: 500 }}>{app.memberDisplayName}</span>
                    <span style={{ fontSize: '0.8125rem', color: '#6b7280', display: 'block' }}>
                      {formatGBP(app.requestedAmountMinor)} · {app.requestedTermPeriods} period{app.requestedTermPeriods !== 1 ? 's' : ''} · {formatUKDate(app.submittedAt)}
                    </span>
                    {app.eligibilityHint && (
                      <span style={{ fontSize: '0.75rem', color: '#059669', display: 'block' }}>{app.eligibilityHint}</span>
                    )}
                    {app.riskFlags && app.riskFlags.length > 0 && (
                      <span style={{ fontSize: '0.75rem', color: '#dc2626', display: 'block' }}>{app.riskFlags.join(', ')}</span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.8125rem', color: '#6b7280' }}>{app.status}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
