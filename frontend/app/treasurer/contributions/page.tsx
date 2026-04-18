'use client';

import React, { useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { PageHeader, EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui';
import { formatGBP } from '@/lib/format/currency';
import { formatUKDate } from '@/lib/format/date';
import {
  useTreasurerGroupId,
  useMeetingsByGroup,
  useMembersByGroup,
  useContributionListByGroup,
  type ContributionListFilters,
} from '@/lib/api/hooks/treasurer';
import { EvidenceBadge } from '@/components/evidence';

const TRANSACTION_MODES = ['CASH', 'BANK_TRANSFER'] as const;
const FUND_BUCKETS = ['SAVINGS', 'SOCIAL_FUND'] as const;
const STATUSES = ['RECORDED', 'REVERSED'] as const;

function useFiltersFromUrl(): [ContributionListFilters, (updates: Partial<ContributionListFilters>) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters: ContributionListFilters = useMemo(() => ({
    dateFrom: searchParams.get('dateFrom') ?? undefined,
    dateTo: searchParams.get('dateTo') ?? undefined,
    meetingId: searchParams.get('meetingId') ?? undefined,
    memberId: searchParams.get('memberId') ?? undefined,
    transactionMode: (searchParams.get('transactionMode') as 'CASH' | 'BANK_TRANSFER') || undefined,
    fundBucket: (searchParams.get('fundBucket') as 'SAVINGS' | 'SOCIAL_FUND') || undefined,
    status: (searchParams.get('status') as 'RECORDED' | 'REVERSED') || undefined,
  }), [searchParams]);

  const setFilters = useCallback((updates: Partial<ContributionListFilters>) => {
    const next = new URLSearchParams(searchParams.toString());
    const keys: (keyof ContributionListFilters)[] = ['dateFrom', 'dateTo', 'meetingId', 'memberId', 'transactionMode', 'fundBucket', 'status'];
    keys.forEach((k) => {
      const v = updates[k] ?? filters[k];
      if (v != null && v !== '') next.set(k, String(v));
      else next.delete(k);
    });
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [router, pathname, searchParams, filters]);

  return [filters, setFilters];
}

export default function TreasurerContributionsPage() {
  const groupId = useTreasurerGroupId();
  const [filters, setFilters] = useFiltersFromUrl();
  const list = useContributionListByGroup(groupId, filters);
  const meetings = useMeetingsByGroup(groupId);
  const members = useMembersByGroup(groupId);

  if (list.isError) {
    return (
      <>
        <PageHeader title="Contributions" backHref="/treasurer" backLabel="Back to Dashboard" />
        <ErrorState message="Could not load contributions." onRetry={() => list.refetch()} />
      </>
    );
  }

  const contributions = list.data?.contributions ?? [];
  const totalSavings = list.data?.totalSavingsMinor ?? 0;
  const totalSocial = list.data?.totalSocialFundMinor ?? 0;
  const totalAmount = list.data?.totalAmountMinor ?? 0;
  const byMode = list.data?.byMode ?? { CASH: { count: 0, savingsMinor: 0, socialFundMinor: 0 }, BANK_TRANSFER: { count: 0, savingsMinor: 0, socialFundMinor: 0 } };

  return (
    <>
      <PageHeader title="Contributions" backHref="/treasurer" backLabel="Back to Dashboard" />
      <p style={{ marginBottom: '1rem' }}>
        <Link href="/treasurer/contributions/meeting" style={{ fontSize: '0.875rem', color: '#2563eb', fontWeight: 500 }}>
          Start meeting entry
        </Link>
      </p>

      <section style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Filters</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end' }}>
          <label style={{ fontSize: '0.8125rem' }}>
            From
            <input
              type="date"
              value={filters.dateFrom ?? ''}
              onChange={(e) => setFilters({ dateFrom: e.target.value || undefined })}
              style={{ display: 'block', marginTop: '0.25rem', padding: '0.35rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
          </label>
          <label style={{ fontSize: '0.8125rem' }}>
            To
            <input
              type="date"
              value={filters.dateTo ?? ''}
              onChange={(e) => setFilters({ dateTo: e.target.value || undefined })}
              style={{ display: 'block', marginTop: '0.25rem', padding: '0.35rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
          </label>
          <label style={{ fontSize: '0.8125rem' }}>
            Meeting
            <select
              value={filters.meetingId ?? ''}
              onChange={(e) => setFilters({ meetingId: e.target.value || undefined })}
              style={{ display: 'block', marginTop: '0.25rem', padding: '0.35rem 0.5rem', minWidth: '10rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            >
              <option value="">All</option>
              {(meetings.data ?? []).map((m) => (
                <option key={m.id} value={m.id}>{m.name || formatUKDate(m.heldAt)}</option>
              ))}
            </select>
          </label>
          <label style={{ fontSize: '0.8125rem' }}>
            Member
            <select
              value={filters.memberId ?? ''}
              onChange={(e) => setFilters({ memberId: e.target.value || undefined })}
              style={{ display: 'block', marginTop: '0.25rem', padding: '0.35rem 0.5rem', minWidth: '10rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            >
              <option value="">All</option>
              {(members.data ?? []).map((m) => (
                <option key={m.id} value={m.id}>{m.displayName}</option>
              ))}
            </select>
          </label>
          <label style={{ fontSize: '0.8125rem' }}>
            Mode
            <select
              value={filters.transactionMode ?? ''}
              onChange={(e) => setFilters({ transactionMode: (e.target.value as 'CASH' | 'BANK_TRANSFER') || undefined })}
              style={{ display: 'block', marginTop: '0.25rem', padding: '0.35rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            >
              <option value="">All</option>
              {TRANSACTION_MODES.map((m) => (
                <option key={m} value={m}>{m === 'BANK_TRANSFER' ? 'Bank transfer' : 'Cash'}</option>
              ))}
            </select>
          </label>
          <label style={{ fontSize: '0.8125rem' }}>
            Fund bucket
            <select
              value={filters.fundBucket ?? ''}
              onChange={(e) => setFilters({ fundBucket: (e.target.value as 'SAVINGS' | 'SOCIAL_FUND') || undefined })}
              style={{ display: 'block', marginTop: '0.25rem', padding: '0.35rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            >
              <option value="">All</option>
              {FUND_BUCKETS.map((b) => (
                <option key={b} value={b}>{b === 'SOCIAL_FUND' ? 'Social fund' : 'Savings'}</option>
              ))}
            </select>
          </label>
          <label style={{ fontSize: '0.8125rem' }}>
            Status
            <select
              value={filters.status ?? ''}
              onChange={(e) => setFilters({ status: (e.target.value as 'RECORDED' | 'REVERSED') || undefined })}
              style={{ display: 'block', marginTop: '0.25rem', padding: '0.35rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            >
              <option value="">All</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s === 'REVERSED' ? 'Reversed' : 'Recorded'}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {list.isLoading ? (
        <LoadingSkeleton variant="list" lines={6} />
      ) : (
        <>
          <section style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Totals</h3>
            <p style={{ margin: '0.25rem 0' }}><strong>Savings total:</strong> {formatGBP(totalSavings)}</p>
            <p style={{ margin: '0.25rem 0' }}><strong>Social fund total:</strong> {formatGBP(totalSocial)}</p>
            <p style={{ margin: '0.25rem 0' }}><strong>Total collected:</strong> {formatGBP(totalAmount)}</p>
            <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
              Cash: {byMode.CASH.count} ({formatGBP(byMode.CASH.savingsMinor + byMode.CASH.socialFundMinor)}) · Bank transfer: {byMode.BANK_TRANSFER.count} ({formatGBP(byMode.BANK_TRANSFER.savingsMinor + byMode.BANK_TRANSFER.socialFundMinor)})
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Contributions</h3>
            {contributions.length === 0 ? (
              <EmptyState title="No contributions" description="Record contributions via meeting entry or adjust filters." />
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {contributions.map((c) => (
                  <li key={c.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid #e5e7eb' }}>
                    <Link
                      href={`/treasurer/contributions/${c.id}`}
                      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <span style={{ fontWeight: 500 }}>{formatGBP(c.totalAmountMinor)}</span>
                          <span style={{ fontSize: '0.8125rem', color: '#6b7280', display: 'block' }}>
                            {c.transactionMode ?? '—'} · {formatUKDate(c.recordedAt ?? c.createdAt)} · {c.status === 'REVERSED' ? 'Reversed' : 'Recorded'}
                          </span>
                          {(c.evidencePresence?.hasText || c.evidencePresence?.hasImage) && (
                            <EvidenceBadge
                              textRef={c.evidencePresence?.hasText ? (c.externalReferenceText ?? '') : undefined}
                              hasImage={c.evidencePresence?.hasImage}
                            />
                          )}
                        </div>
                        <span style={{ fontSize: '0.8125rem', color: '#6b7280' }}>View</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </>
  );
}
