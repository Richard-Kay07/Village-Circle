'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader, StatCard, EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui';
import { formatGBP } from '@/lib/format/currency';
import { useMemberSession } from '@/lib/member/context';
import { useLedgerBalance, useLoansByGroup } from '@/lib/api/hooks/member';
import { getCopy, COPY_KEYS } from '@/lib/copy';

export default function MemberDashboardPage() {
  const session = useMemberSession();
  const groupId = session?.groupId ?? null;
  const memberId = session?.memberId ?? null;

  const savingsBalance = useLedgerBalance(groupId, 'SAVINGS');
  const socialFundBalance = useLedgerBalance(groupId, 'SOCIAL_FUND');
  const loansQuery = useLoansByGroup(groupId, memberId);

  const myLoans = loansQuery.data?.filter((l) => l.borrowerId === memberId) ?? [];
  const activeLoanBalance = myLoans
    .filter((l) => l.state === 'ACTIVE' || l.state === 'DISBURSEMENT_RECORDED')
    .reduce((sum, l) => sum + l.principalAmountMinor - l.totalRepaidMinor, 0);
  const overduePlaceholder = 0;

  const isLoading = savingsBalance.isLoading || socialFundBalance.isLoading || loansQuery.isLoading;
  const hasError = savingsBalance.isError || socialFundBalance.isError || loansQuery.isError;

  if (hasError) {
    return (
      <>
        <PageHeader title={getCopy(COPY_KEYS.member_dashboard_title)} subtitle={getCopy(COPY_KEYS.member_dashboard_subtitle)} />
        <ErrorState message={getCopy(COPY_KEYS.member_dashboard_errorLoad)} onRetry={() => { savingsBalance.refetch(); socialFundBalance.refetch(); loansQuery.refetch(); }} />
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <PageHeader title={getCopy(COPY_KEYS.member_dashboard_title)} subtitle={getCopy(COPY_KEYS.member_dashboard_subtitle)} />
        <LoadingSkeleton variant="card" />
        <LoadingSkeleton variant="list" lines={4} />
      </>
    );
  }

  return (
    <>
      <PageHeader title={getCopy(COPY_KEYS.member_dashboard_title)} subtitle={getCopy(COPY_KEYS.member_dashboard_subtitle)} />
      <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard label={getCopy(COPY_KEYS.member_dashboard_savingsTotal)} value={formatGBP(savingsBalance.data?.balance ?? 0)} variant="default" />
        <StatCard label={getCopy(COPY_KEYS.member_dashboard_socialFundTotal)} value={formatGBP(socialFundBalance.data?.balance ?? 0)} variant="default" />
        <StatCard label={getCopy(COPY_KEYS.member_dashboard_activeLoanBalance)} value={formatGBP(activeLoanBalance)} variant="muted" />
        {overduePlaceholder > 0 && (
          <StatCard label="Overdue" value={formatGBP(overduePlaceholder)} subtitle="Pay to avoid penalties" variant="muted" />
        )}
      </div>
      <section style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>{getCopy(COPY_KEYS.member_dashboard_recentActivity)}</h3>
        <EmptyState
          title={getCopy(COPY_KEYS.member_dashboard_noRecentActivity)}
          description={getCopy(COPY_KEYS.member_dashboard_noRecentActivityDescription)}
          action={<Link href="/member/statements" style={{ fontSize: '0.875rem', color: '#2563eb' }}>{getCopy(COPY_KEYS.member_dashboard_viewStatements)}</Link>}
        />
      </section>
      <section>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>{getCopy(COPY_KEYS.member_dashboard_upcoming)}</h3>
        <EmptyState title={getCopy(COPY_KEYS.member_dashboard_noUpcomingMeetings)} description={getCopy(COPY_KEYS.member_dashboard_noUpcomingMeetingsDescription)} />
      </section>
    </>
  );
}
