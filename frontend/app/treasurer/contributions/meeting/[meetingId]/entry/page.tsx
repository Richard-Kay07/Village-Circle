'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui';
import { CurrencyInput } from '@/components/forms';
import { formatGBP } from '@/lib/format/currency';
import { useTreasurerGroupId, useMembersByGroup, useRecordBulkContributions } from '@/lib/api/hooks/treasurer';
import { useBeforeUnload } from '@/lib/useBeforeUnload';
import { getCopy, getCopyTemplate, COPY_KEYS } from '@/lib/copy';

type Step = 'entry' | 'review';

interface RowState {
  memberId: string;
  displayName: string;
  transactionMode: 'CASH' | 'BANK_TRANSFER';
  savingsMinor: number;
  socialMinor: number;
  ref: string;
  skipped: boolean;
}

function buildIdempotencyKey(meetingId: string, memberId: string): string {
  return `meeting-${meetingId}-member-${memberId}`;
}

export default function TreasurerMeetingEntryPage({ params }: { params: { meetingId: string } }) {
  const router = useRouter();
  const groupId = useTreasurerGroupId();
  const meetingId = params.meetingId;
  const members = useMembersByGroup(groupId);
  const recordBulk = useRecordBulkContributions(groupId);

  const [step, setStep] = useState<Step>('entry');
  const [rows, setRows] = useState<RowState[]>([]);

  const membersList = members.data ?? [];
  useEffect(() => {
    if (rows.length === 0 && membersList.length > 0) {
      setRows(
        membersList.map((m) => ({
          memberId: m.id,
          displayName: m.displayName,
          transactionMode: 'CASH' as const,
          savingsMinor: 0,
          socialMinor: 0,
          ref: '',
          skipped: false,
        }))
      );
    }
  }, [membersList.length, rows.length]);

  const displayRows = rows.length > 0 ? rows : membersList.map((m): RowState => ({
    memberId: m.id,
    displayName: m.displayName,
    transactionMode: 'CASH' as const,
    savingsMinor: 0,
    socialMinor: 0,
    ref: '',
    skipped: false,
  }));

  const updateRow = (idx: number, patch: Partial<RowState>) => {
    setRows((prev) => {
      const base = prev.length ? prev : displayRows;
      const next = [...base];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  };

  const toSubmit = displayRows.filter((r) => !r.skipped && (r.savingsMinor > 0 || r.socialMinor > 0));
  const savingsTotal = toSubmit.reduce((s, r) => s + r.savingsMinor, 0);
  const socialTotal = toSubmit.reduce((s, r) => s + r.socialMinor, 0);
  const totalCollected = savingsTotal + socialTotal;
  const cashCount = toSubmit.filter((r) => r.transactionMode === 'CASH').length;
  const bankCount = toSubmit.filter((r) => r.transactionMode === 'BANK_TRANSFER').length;

  const canSubmit = toSubmit.length > 0 && toSubmit.every((r) => r.savingsMinor + r.socialMinor >= 0);
  const formDirty = step === 'entry' && displayRows.some((r) => !r.skipped && (r.savingsMinor > 0 || r.socialMinor > 0 || !!r.ref.trim()));
  useBeforeUnload(formDirty);

  const handleGoToReview = () => {
    setStep('review');
  };

  const handleSubmit = async () => {
    const contributions = toSubmit.map((r) => ({
      memberProfileId: r.memberId,
      transactionMode: r.transactionMode,
      savingsAmountMinor: r.savingsMinor,
      socialFundAmountMinor: r.socialMinor,
      externalReferenceText: r.ref.trim() || undefined,
      evidenceAttachmentId: undefined as string | undefined,
      idempotencyKey: buildIdempotencyKey(meetingId, r.memberId),
    }));
    try {
      await recordBulk.mutateAsync({ meetingId, contributions });
      router.push(`/treasurer/contributions/meeting/${meetingId}?success=1`);
    } catch {
      // Error from mutation
    }
  };

  if (members.isError) {
    return (
      <>
        <PageHeader title={getCopy(COPY_KEYS.ops_meeting_entry_title)} backHref="/treasurer/contributions/meeting" backLabel={getCopy(COPY_KEYS.ops_meeting_entry_backToMeetings)} />
        <ErrorState message={getCopy(COPY_KEYS.ops_meeting_entry_errorLoadMembers)} onRetry={() => members.refetch()} />
      </>
    );
  }

  if (members.isLoading) {
    return (
      <>
        <PageHeader title={getCopy(COPY_KEYS.ops_meeting_entry_title)} backHref="/treasurer/contributions/meeting" backLabel={getCopy(COPY_KEYS.ops_meeting_entry_backToMeetings)} />
        <LoadingSkeleton variant="list" lines={6} />
      </>
    );
  }

  if (membersList.length === 0) {
    return (
      <>
        <PageHeader title={getCopy(COPY_KEYS.ops_meeting_entry_title)} backHref="/treasurer/contributions/meeting" backLabel={getCopy(COPY_KEYS.ops_meeting_entry_backToMeetings)} />
        <EmptyState title={getCopy(COPY_KEYS.ops_meeting_entry_noMembersTitle)} description={getCopy(COPY_KEYS.ops_meeting_entry_noMembersDescription)} />
      </>
    );
  }

  return (
    <>
      <PageHeader title={getCopy(COPY_KEYS.ops_meeting_entry_title)} backHref="/treasurer/contributions/meeting" backLabel={getCopy(COPY_KEYS.ops_meeting_entry_backToMeetings)} />

      {step === 'entry' && (
        <>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
            {getCopy(COPY_KEYS.ops_meeting_entry_helpText)}
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {displayRows.map((r, idx) => (
              <li key={r.memberId} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: r.skipped ? '#f9fafb' : '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <strong style={{ fontSize: '0.9375rem' }}>{r.displayName}</strong>
                  <div style={{ display: 'flex', gap: '0.5rem', minHeight: 44, alignItems: 'center' }} role="group" aria-label={`${getCopy(COPY_KEYS.save_transactionMode_label)} for ${r.displayName}`}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, paddingRight: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                      <input type="radio" checked={r.transactionMode === 'CASH'} onChange={() => updateRow(idx, { transactionMode: 'CASH' })} aria-label={getCopy(COPY_KEYS.save_transactionMode_cash)} /> <span style={{ marginLeft: '0.25rem' }}>{getCopy(COPY_KEYS.save_transactionMode_cashShort)}</span>
                    </label>
                    <label style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, fontSize: '0.875rem', cursor: 'pointer' }}>
                      <input type="radio" checked={r.transactionMode === 'BANK_TRANSFER'} onChange={() => updateRow(idx, { transactionMode: 'BANK_TRANSFER' })} aria-label={getCopy(COPY_KEYS.save_transactionMode_bank)} /> <span style={{ marginLeft: '0.25rem' }}>{getCopy(COPY_KEYS.save_transactionMode_bankShort)}</span>
                    </label>
                  </div>
                </div>
                {r.skipped ? (
                  <p style={{ fontSize: '0.8125rem', color: '#6b7280', margin: 0 }}>Absent / zero contribution</p>
                ) : (
                  <>
                    <div className="meeting-entry-row-grid" style={{ marginBottom: '0.5rem' }}>
                      <CurrencyInput
                        label={getCopy(COPY_KEYS.ops_meeting_entry_savingsLabel)}
                        valueMinor={r.savingsMinor}
                        onChangeMinor={(v) => updateRow(idx, { savingsMinor: v })}
                        minMinor={0}
                      />
                      <CurrencyInput
                        label={getCopy(COPY_KEYS.ops_meeting_entry_socialFundLabel)}
                        valueMinor={r.socialMinor}
                        onChangeMinor={(v) => updateRow(idx, { socialMinor: v })}
                        minMinor={0}
                      />
                    </div>
                    <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      {getCopy(COPY_KEYS.ops_meeting_entry_totalLabel)}: {formatGBP(r.savingsMinor + r.socialMinor)}
                    </div>
                    <input
                      type="text"
                      placeholder={getCopy(COPY_KEYS.save_externalRef_placeholder)}
                      value={r.ref}
                      onChange={(e) => updateRow(idx, { ref: e.target.value })}
                      style={{ width: '100%', padding: '0.375rem', fontSize: '0.8125rem', border: '1px solid #e5e7eb', borderRadius: '4px', marginBottom: '0.5rem' }}
                    />
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>{getCopy(COPY_KEYS.save_evidence_optionalDetail)}</p>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => updateRow(idx, { skipped: !r.skipped, savingsMinor: 0, socialMinor: 0 })}
                  style={{ marginTop: '0.5rem', minHeight: 44, padding: '0.5rem 0.75rem', fontSize: '0.875rem', cursor: 'pointer' }}
                  aria-label={r.skipped ? `${getCopy(COPY_KEYS.ops_meeting_entry_includeMember)} in entry` : `Mark member absent or zero`}
                >
                  {r.skipped ? getCopy(COPY_KEYS.ops_meeting_entry_includeMember) : getCopy(COPY_KEYS.ops_meeting_entry_markAbsent)}
                </button>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={handleGoToReview}
              disabled={toSubmit.length === 0}
              style={{ minHeight: 44, padding: '0.5rem 1rem', fontSize: '1rem', fontWeight: 500, cursor: toSubmit.length === 0 ? 'not-allowed' : 'pointer' }}
              aria-label={getCopy(COPY_KEYS.ops_meeting_entry_reviewSubmit)}
            >
              {getCopy(COPY_KEYS.ops_meeting_entry_reviewSubmit)}
            </button>
          </div>
        </>
      )}

      {step === 'review' && (
        <>
          <section style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>{getCopy(COPY_KEYS.save_batch_summaryTitle)}</h3>
            <p style={{ margin: '0.25rem 0' }}><strong>{getCopy(COPY_KEYS.save_batch_savingsTotal)}:</strong> {formatGBP(savingsTotal)}</p>
            <p style={{ margin: '0.25rem 0' }}><strong>{getCopy(COPY_KEYS.save_batch_socialFundTotal)}:</strong> {formatGBP(socialTotal)}</p>
            <p style={{ margin: '0.25rem 0' }}><strong>{getCopy(COPY_KEYS.save_batch_totalCollected)}:</strong> {formatGBP(totalCollected)}</p>
            <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>{getCopy(COPY_KEYS.save_batch_cashCount)}: {cashCount} · {getCopy(COPY_KEYS.save_batch_bankCount)}: {bankCount}</p>
          </section>
          <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>{getCopyTemplate(COPY_KEYS.save_batch_willBeRecorded, { count: toSubmit.length })}</p>
          {recordBulk.isError && (
            <p style={{ fontSize: '0.875rem', color: '#dc2626', marginBottom: '0.5rem' }}>{(recordBulk.error as Error)?.message}</p>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button type="button" onClick={() => setStep('entry')} disabled={recordBulk.isPending} style={{ minHeight: 44, padding: '0.5rem 1rem', cursor: 'pointer' }} aria-label={getCopy(COPY_KEYS.ops_meeting_entry_backToEntry)}>
              {getCopy(COPY_KEYS.ops_meeting_entry_backToEntry)}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || recordBulk.isPending}
              aria-busy={recordBulk.isPending}
              aria-label={recordBulk.isPending ? getCopy(COPY_KEYS.save_batch_submitting) : getCopy(COPY_KEYS.ops_meeting_entry_submitBatch)}
              style={{ minHeight: 44, padding: '0.5rem 1rem', fontWeight: 500, cursor: !canSubmit || recordBulk.isPending ? 'not-allowed' : 'pointer' }}
            >
              {recordBulk.isPending ? getCopy(COPY_KEYS.save_batch_submitting) : getCopy(COPY_KEYS.ops_meeting_entry_submitBatch)}
            </button>
          </div>
        </>
      )}
    </>
  );
}
