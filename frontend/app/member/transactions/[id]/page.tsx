'use client';

import React from 'react';
import { PageHeader, EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui';
import { formatGBP, formatUKDate } from '@/lib/format';
import { useMemberSession } from '@/lib/member/context';
import { useContributionDetail } from '@/lib/api/hooks/member';
import { useEvidenceMetadata } from '@/lib/api/hooks/evidence';
import { EvidenceViewer } from '@/components/evidence';

export default function MemberTransactionDetailPage({ params }: { params: { id: string } }) {
  const session = useMemberSession();
  const detail = useContributionDetail(params.id, session?.groupId ?? null);
  const evidenceMeta = useEvidenceMetadata(
    detail.data?.evidenceAttachmentId ?? null,
    session?.memberId ?? null
  );

  if (detail.isError) {
    return (
      <>
        <PageHeader title="Transaction" backHref="/member/statements" backLabel="Back to Statements" />
        <ErrorState message="Could not load transaction or you do not have access." onRetry={() => detail.refetch()} />
      </>
    );
  }

  if (detail.isLoading || !detail.data) {
    return (
      <>
        <PageHeader title="Transaction" backHref="/member/statements" backLabel="Back to Statements" />
        <LoadingSkeleton variant="card" />
      </>
    );
  }

  const d = detail.data;
  const isOwn = d.memberProfileId === session?.memberId;
  if (!isOwn) {
    return (
      <>
        <PageHeader title="Transaction" backHref="/member/statements" backLabel="Back to Statements" />
        <EmptyState title="Access restricted" description="You can only view your own transactions." />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Transaction" backHref="/member/statements" backLabel="Back to Statements" />
      <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Date</span>
          <div style={{ fontWeight: 500 }}>{formatUKDate(d.createdAt)}</div>
        </div>
        <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Total amount</span>
          <div style={{ fontWeight: 600 }}>{formatGBP(d.totalAmountMinor)}</div>
        </div>
        <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Savings</span>
          <div style={{ fontWeight: 500 }}>{formatGBP(d.savingsAmountMinor)}</div>
        </div>
        <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Social fund</span>
          <div style={{ fontWeight: 500 }}>{formatGBP(d.socialFundAmountMinor)}</div>
        </div>
        <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Status</span>
          <div style={{ fontWeight: 500 }}>
            <span
              style={{
                display: 'inline-block',
                fontSize: '0.8125rem',
                fontWeight: 600,
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                backgroundColor: d.status === 'REVERSED' ? '#fef3c7' : '#dcfce7',
                color: d.status === 'REVERSED' ? '#92400e' : '#166534',
              }}
            >
              {d.status}
            </span>
          </div>
        </div>
      </div>
      <section>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Evidence</h3>
        <EvidenceViewer
          textRef={d.externalReferenceText ?? undefined}
          evidenceId={d.evidenceAttachmentId ?? undefined}
          metadata={evidenceMeta.data ?? undefined}
          restricted={!!d.evidenceAttachmentId && evidenceMeta.isError}
        />
      </section>
    </>
  );
}
