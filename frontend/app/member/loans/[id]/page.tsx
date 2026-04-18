'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader, EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui';
import { formatGBP, formatUKDate } from '@/lib/format';
import { useMemberSession } from '@/lib/member/context';
import { useLoanDetail, type LoanRepaymentItem } from '@/lib/api/hooks/member';
import { EvidenceBadge } from '@/components/evidence';
import { LoanScheduleTable, LoanExceptionHistory } from '@/components/loan';

export default function MemberLoanDetailPage({ params }: { params: { id: string } }) {
  const session = useMemberSession();
  const loan = useLoanDetail(params.id, session?.memberId ?? null);

  if (loan.isError) {
    return (
      <>
        <PageHeader title="Loan" backHref="/member/loans" backLabel="Back to My Loans" />
        <ErrorState message="Could not load loan." onRetry={() => loan.refetch()} />
      </>
    );
  }

  if (loan.isLoading || !loan.data) {
    return (
      <>
        <PageHeader title="Loan" backHref="/member/loans" backLabel="Back to My Loans" />
        <LoadingSkeleton variant="card" />
      </>
    );
  }

  const d = loan.data;
  const outstanding = d.principalAmountMinor - d.totalRepaidMinor;

  return (
    <>
      <PageHeader title="Loan" backHref="/member/loans" backLabel="Back to My Loans" />
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Principal</span>
            <div style={{ fontWeight: 600 }}>{formatGBP(d.principalAmountMinor)}</div>
          </div>
          <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Repaid</span>
            <div style={{ fontWeight: 600 }}>{formatGBP(d.totalRepaidMinor)}</div>
          </div>
          <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Outstanding</span>
            <div style={{ fontWeight: 600 }}>{formatGBP(outstanding)}</div>
          </div>
        </div>
      </div>
      <section style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Rule snapshot</h3>
        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          Interest: {d.interestEnabledSnapshot ? 'Enabled' : 'Disabled'}
          {d.interestEnabledSnapshot && ` · Rate ${(d.interestRateBpsSnapshot / 100).toFixed(2)}%`}
          {d.interestEnabledSnapshot && d.interestBasisSnapshot && ` · Basis ${d.interestBasisSnapshot}`}
          {' · Term '}{d.termPeriods} periods
          {d.ruleVersionIdSnapshot && ` · Rule version ${d.ruleVersionIdSnapshot}`}
        </p>
      </section>
      <section style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Schedule</h3>
        <LoanScheduleTable scheduleItems={d.scheduleItems ?? []} />
      </section>
      <section style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Exception history</h3>
        <LoanExceptionHistory exceptionEvents={d.exceptionEvents} />
      </section>
      <section>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Repayment history</h3>
        {!d.repayments?.length ? (
          <EmptyState title="No repayments yet" description="Repayments will show transaction mode and evidence when recorded." />
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {(d.repayments ?? []).slice().reverse().map((r: LoanRepaymentItem) => (
              <li key={r.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid #e5e7eb' }}>
                <span style={{ fontWeight: 500 }}>{formatGBP(r.amountMinor)}</span>
                <span style={{ fontSize: '0.8125rem', color: '#6b7280', display: 'block' }}>
                  {r.transactionMode} · {formatUKDate(r.recordedAt)}
                  {r.type !== 'REPAYMENT' && ` · ${r.type}`}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  Principal {formatGBP(r.principalMinor)}
                  {r.interestMinor > 0 && ` · Interest ${formatGBP(r.interestMinor)}`}
                  {r.penaltyMinor > 0 && ` · Penalty ${formatGBP(r.penaltyMinor)}`}
                </span>
                {(r.evidencePresence?.hasText || r.evidencePresence?.hasImage) && (
                  <EvidenceBadge
                    textRef={r.evidencePresence?.hasText ? (r.externalReferenceText ?? '') : undefined}
                    hasImage={r.evidencePresence?.hasImage}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
