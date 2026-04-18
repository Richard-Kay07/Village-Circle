'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PageHeader, EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui';
import { formatGBP } from '@/lib/format/currency';
import { formatUKDate } from '@/lib/format/date';
import { useCapabilities } from '@/lib/context/capabilities-context';
import {
  useTreasurerGroupId,
  useContributionDetailTreasurer,
  useReversalContribution,
} from '@/lib/api/hooks/treasurer';
import { useEvidenceMetadata } from '@/lib/api/hooks/evidence';
import { EvidenceBadge, EvidenceViewer } from '@/components/evidence';
import { getCopy, COPY_KEYS } from '@/lib/copy';

const DEMO_MEMBER_ID = process.env.NEXT_PUBLIC_DEMO_MEMBER_ID ?? 'demo-member';

export default function TreasurerContributionDetailPage({ params }: { params: { id: string } }) {
  const groupId = useTreasurerGroupId();
  const detail = useContributionDetailTreasurer(params.id, groupId);
  const evidenceMeta = useEvidenceMetadata(
    detail.data?.evidenceAttachmentId ?? null,
    DEMO_MEMBER_ID
  );
  const reversal = useReversalContribution(groupId);
  const capabilities = useCapabilities();
  const canReverse = capabilities.includes('contribution.reverse');
  const canTrace = capabilities.includes('audit.read') || capabilities.includes('admin.support_access');

  const [reversalReason, setReversalReason] = useState('');
  const [showReversalModal, setShowReversalModal] = useState(false);

  const handleReverseClick = () => {
    setReversalReason('');
    setShowReversalModal(true);
  };

  const handleReversalConfirm = async () => {
    if (!params.id || !reversalReason.trim()) return;
    try {
      await reversal.mutateAsync({ contributionId: params.id, reversalReason: reversalReason.trim() });
      setShowReversalModal(false);
      detail.refetch();
    } catch {
      // Error from mutation
    }
  };

  if (detail.isError) {
    return (
      <>
        <PageHeader title="Contribution" backHref="/treasurer/contributions" backLabel="Back to Contributions" />
        <ErrorState message="Could not load contribution." onRetry={() => detail.refetch()} />
      </>
    );
  }

  if (detail.isLoading || !detail.data) {
    return (
      <>
        <PageHeader title="Contribution" backHref="/treasurer/contributions" backLabel="Back to Contributions" />
        <LoadingSkeleton variant="card" />
      </>
    );
  }

  const d = detail.data;
  const isReversed = d.status === 'REVERSED';

  return (
    <>
      <PageHeader title="Contribution" backHref="/treasurer/contributions" backLabel="Back to Contributions" />

      {isReversed && (
        <div
          role="status"
          style={{
            marginBottom: '1rem',
            padding: '0.75rem',
            backgroundColor: '#fef2f2',
            color: '#991b1b',
            borderRadius: '8px',
            fontSize: '0.875rem',
          }}
        >
          {getCopy(COPY_KEYS.immutable_recordReversedMessage)}
        </div>
      )}

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
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Transaction mode</span>
          <div style={{ fontWeight: 500 }}>{d.transactionMode ?? '—'}</div>
        </div>
        <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Status</span>
          <div style={{ fontWeight: 500 }}>{d.status}</div>
        </div>
        {d.externalReferenceText && (
          <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Text reference</span>
            <div style={{ fontWeight: 500 }}>{d.externalReferenceText}</div>
          </div>
        )}
      </div>

      <section style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Evidence</h3>
        <EvidenceBadge
          textRef={d.externalReferenceText ?? undefined}
          hasImage={!!d.evidenceAttachmentId}
        />
        <div style={{ marginTop: '0.5rem' }}>
          <EvidenceViewer
            textRef={d.externalReferenceText ?? undefined}
            evidenceId={d.evidenceAttachmentId ?? undefined}
            metadata={evidenceMeta.data ?? undefined}
            restricted={!!d.evidenceAttachmentId && evidenceMeta.isError}
          />
        </div>
      </section>

      {isReversed && (d.reversedAt != null || d.reversalReason) && (
        <section style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#fef2f2', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Reversal details</h3>
          {d.reversedAt != null && (
            <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
              <strong>Reversed at:</strong> {formatUKDate(String(d.reversedAt))}
            </p>
          )}
          {d.reversalReason && (
            <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
              <strong>Reason:</strong> {d.reversalReason}
            </p>
          )}
        </section>
      )}

      {canTrace && (d.ledgerEventId != null || d.idempotencyKey != null) && (
        <section style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Audit</h3>
          {d.ledgerEventId && (
            <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
              <strong>Ledger event:</strong> {d.ledgerEventId}
            </p>
          )}
          {d.idempotencyKey && (
            <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
              <strong>Idempotency key:</strong> {d.idempotencyKey}
            </p>
          )}
          <p style={{ marginTop: '0.5rem' }}>
            <Link
              href={`/admin/traces?entityType=contribution&entityId=${encodeURIComponent(d.id)}`}
              style={{ fontSize: '0.875rem', color: '#2563eb' }}
            >
              View trace (support)
            </Link>
          </p>
        </section>
      )}

      {!isReversed && canReverse && (
        <div style={{ marginTop: '1rem' }}>
          <button
            type="button"
            onClick={handleReverseClick}
            disabled={reversal.isPending}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc2626',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            Reverse contribution
          </button>
        </div>
      )}

      {showReversalModal && (
        <div
          role="dialog"
          aria-labelledby="reversal-title"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 1000,
          }}
        >
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '1.5rem', maxWidth: '22rem', width: '100%' }}>
            <h2 id="reversal-title" style={{ margin: '0 0 0.5rem', fontSize: '1.125rem', fontWeight: 600 }}>
              Reverse contribution
            </h2>
            <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: '#4b5563' }}>
              {getCopy(COPY_KEYS.immutable_reversalExplanation)}
            </p>
            <label htmlFor="reversal-reason" style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
              Reason (required)
            </label>
            <textarea
              id="reversal-reason"
              value={reversalReason}
              onChange={(e) => setReversalReason(e.target.value)}
              placeholder="e.g. Duplicate entry"
              rows={2}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem',
                marginBottom: '1rem',
              }}
            />
            {reversal.isError && (
              <p style={{ fontSize: '0.8125rem', color: '#dc2626', marginBottom: '0.5rem' }}>
                {(reversal.error as Error)?.message}
              </p>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowReversalModal(false)}
                disabled={reversal.isPending}
                style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReversalConfirm}
                disabled={!reversalReason.trim() || reversal.isPending}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Reverse
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
