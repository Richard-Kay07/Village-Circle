'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader, EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui';
import { formatGBP } from '@/lib/format/currency';
import { useTreasurerGroupId, useLoansByGroupTreasurer } from '@/lib/api/hooks/treasurer';

export default function TreasurerActiveLoansPage() {
  const groupId = useTreasurerGroupId();
  const list = useLoansByGroupTreasurer(groupId);

  if (list.isError) {
    return (
      <>
        <PageHeader title="Active loans" backHref="/treasurer/loans" backLabel="Back to Loans" />
        <ErrorState message="Could not load loans." onRetry={() => list.refetch()} />
      </>
    );
  }

  const loans = list.data ?? [];

  return (
    <>
      <PageHeader title="Active loans" backHref="/treasurer/loans" backLabel="Back to Loans" />
      {list.isLoading ? (
        <LoadingSkeleton variant="list" lines={5} />
      ) : loans.length === 0 ? (
        <EmptyState title="No active loans" description="Approved and disbursed loans appear here. Record repayments from loan detail." />
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {loans.map((loan) => (
            <li key={loan.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <Link
                  href={`/treasurer/loans/loan/${loan.id}`}
                  style={{ fontWeight: 500, textDecoration: 'none', color: 'inherit' }}
                >
                  {formatGBP(loan.principalAmountMinor)} · Repaid {formatGBP(loan.totalRepaidMinor)} · {loan.state}
                </Link>
                <Link
                  href={`/treasurer/loans/loan/${loan.id}/repay`}
                  style={{ fontSize: '0.875rem', color: '#2563eb' }}
                >
                  Record repayment
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
