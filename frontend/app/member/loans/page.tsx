'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQueries } from '@tanstack/react-query';
import { PageHeader, EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui';
import { formatGBP } from '@/lib/format/currency';
import { useMemberSession } from '@/lib/member/context';
import { useLoansByGroup } from '@/lib/api/hooks/member';
import { queryKeys } from '@/lib/api/query-keys';
import { apiClient } from '@/lib/api/client';

export default function MemberLoansPage() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success') === '1';
  const session = useMemberSession();
  const groupId = session?.groupId ?? null;
  const memberId = session?.memberId ?? null;
  const loansList = useLoansByGroup(groupId, memberId);

  const myLoans = loansList.data?.filter((l) => l.borrowerId === memberId) ?? [];
  const detailQueries = useQueries({
    queries: myLoans.map((loan) => ({
      queryKey: queryKeys.loans.detail(loan.id),
      queryFn: () =>
        apiClient.get<{ id: string; interestEnabledSnapshot: boolean; scheduleItems: Array<{ dueDate: string; totalDueMinor: number; status: string }> }>(
          `loans/${loan.id}`,
          { actorMemberId: memberId ?? undefined }
        ),
      enabled: !!memberId,
    })),
  });

  if (loansList.isError) {
    return (
      <>
        <PageHeader title="My Loans" backHref="/member" backLabel="Back to Dashboard" />
        <ErrorState message="Could not load loans." onRetry={() => loansList.refetch()} />
      </>
    );
  }

  if (loansList.isLoading) {
    return (
      <>
        <PageHeader title="My Loans" backHref="/member" backLabel="Back to Dashboard" />
        <LoadingSkeleton variant="list" lines={4} />
      </>
    );
  }

  if (myLoans.length === 0) {
    return (
      <>
        <PageHeader title="My Loans" backHref="/member" backLabel="Back to Dashboard" />
        <EmptyState title="No loans" description="Your loan applications and repayments will appear here." />
        <p style={{ marginTop: '1rem' }}>
          <Link href="/member/loans/request" style={{ fontSize: '0.875rem', color: '#2563eb' }}>Request a loan</Link>
        </p>
      </>
    );
  }

  return (
    <>
      <PageHeader title="My Loans" backHref="/member" backLabel="Back to Dashboard" />
      {success && (
        <div role="status" style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '8px', fontSize: '0.875rem' }}>
          Your loan application was submitted. It will be reviewed by your group.
        </div>
      )}
      <p style={{ marginBottom: '0.75rem' }}>
        <Link href="/member/loans/request" style={{ fontSize: '0.875rem', color: '#2563eb' }}>Request a loan</Link>
      </p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {myLoans.map((loan, i) => {
          const detail = detailQueries[i]?.data;
          const nextDue = detail?.scheduleItems?.find((s) => s.status === 'DUE' || s.status === 'OVERDUE');
          return (
            <li key={loan.id} style={{ marginBottom: '1rem' }}>
              <Link
                href={`/member/loans/${loan.id}`}
                style={{
                  display: 'block',
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600 }}>{formatGBP(loan.principalAmountMinor)}</span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: loan.state === 'ACTIVE' ? '#dcfce7' : '#f3f4f6',
                      color: loan.state === 'ACTIVE' ? '#166534' : '#6b7280',
                    }}
                  >
                    {loan.state}
                  </span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
                  Interest: {detail?.interestEnabledSnapshot === true ? 'Enabled' : detail?.interestEnabledSnapshot === false ? 'Disabled' : '—'}
                </div>
                {nextDue && (
                  <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    Next due: {new Date(nextDue.dueDate).toLocaleDateString('en-GB')} — {formatGBP(nextDue.totalDueMinor)}
                  </div>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
