'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PageHeader, EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui';
import { formatGBP } from '@/lib/format/currency';
import { formatUKDate } from '@/lib/format/date';
import { useCapabilities } from '@/lib/context/capabilities-context';
import { mapApiErrorToUserMessage } from '@/lib/api/errors';
import {
  useTreasurerGroupId,
  useRecordWaiver,
  useRecordReschedule,
  useRecordWriteOff,
} from '@/lib/api/hooks/treasurer';
import { useLoanDetail, type LoanRepaymentItem } from '@/lib/api/hooks/member';
import { EvidenceBadge } from '@/components/evidence';
import { LoanScheduleTable, LoanExceptionHistory } from '@/components/loan';
import { getCopy, COPY_KEYS } from '@/lib/copy';

const DEMO_MEMBER_ID = process.env.NEXT_PUBLIC_DEMO_MEMBER_ID ?? 'demo-member';

export default function TreasurerLoanDetailPage({ params }: { params: { loanId: string } }) {
  const groupId = useTreasurerGroupId();
  const loan = useLoanDetail(params.loanId, DEMO_MEMBER_ID);
  const capabilities = useCapabilities();
  const canRecordRepayment = capabilities.includes('loan.repayment.record');
  const canWaive = capabilities.includes('loan.waive');
  const canReschedule = capabilities.includes('loan.reschedule');
  const canWriteOff = capabilities.includes('loan.writeoff');

  const [waiverOpen, setWaiverOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [writeOffOpen, setWriteOffOpen] = useState(false);
  const [waiverReason, setWaiverReason] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [rescheduleTermPeriods, setRescheduleTermPeriods] = useState('');
  const [rescheduleFirstDue, setRescheduleFirstDue] = useState('');
  const [writeOffReason, setWriteOffReason] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const waiverMutation = useRecordWaiver(groupId);
  const rescheduleMutation = useRecordReschedule(groupId);
  const writeOffMutation = useRecordWriteOff(groupId);

  const handleWaiverSubmit = async () => {
    if (!waiverReason.trim()) return;
    try {
      await waiverMutation.mutateAsync({ loanId: params.loanId, reason: waiverReason.trim(), amountMinorWaived: 0 });
      setWaiverOpen(false);
      setWaiverReason('');
      setSuccessMessage(getCopy(COPY_KEYS.grow_loan_detail_waiverRecorded));
      loan.refetch();
    } catch {
      // Error shown in dialog
    }
  };

  const handleRescheduleSubmit = async () => {
    const term = parseInt(rescheduleTermPeriods, 10);
    if (!rescheduleReason.trim() || !Number.isInteger(term) || term < 1 || !rescheduleFirstDue.trim()) return;
    try {
      await rescheduleMutation.mutateAsync({
        loanId: params.loanId,
        reason: rescheduleReason.trim(),
        newTermPeriods: term,
        firstDueDate: new Date(rescheduleFirstDue).toISOString(),
      });
      setRescheduleOpen(false);
      setRescheduleReason('');
      setRescheduleTermPeriods('');
      setRescheduleFirstDue('');
      setSuccessMessage(getCopy(COPY_KEYS.grow_loan_detail_rescheduleRecorded));
      loan.refetch();
    } catch {
      // Error shown in dialog
    }
  };

  const handleWriteOffSubmit = async () => {
    if (!writeOffReason.trim()) return;
    try {
      await writeOffMutation.mutateAsync({ loanId: params.loanId, reason: writeOffReason.trim() });
      setWriteOffOpen(false);
      setWriteOffReason('');
      setSuccessMessage(getCopy(COPY_KEYS.grow_loan_detail_writeOffRecorded));
      loan.refetch();
    } catch {
      // Error shown in dialog
    }
  };

  if (loan.isError) {
    return (
      <>
        <PageHeader title={getCopy(COPY_KEYS.grow_loan_detail_title)} backHref="/treasurer/loans/active" backLabel={getCopy(COPY_KEYS.grow_loan_detail_backToActive)} />
        <ErrorState message={getCopy(COPY_KEYS.grow_loan_detail_errorLoadLoan)} onRetry={() => loan.refetch()} />
      </>
    );
  }

  if (loan.isLoading || !loan.data) {
    return (
      <>
        <PageHeader title={getCopy(COPY_KEYS.grow_loan_detail_title)} backHref="/treasurer/loans/active" backLabel={getCopy(COPY_KEYS.grow_loan_detail_backToActive)} />
        <LoadingSkeleton variant="card" />
      </>
    );
  }

  const d = loan.data;
  const outstanding = d.principalAmountMinor - d.totalRepaidMinor;
  const repayments: LoanRepaymentItem[] = d.repayments ?? [];

  const outstandingPrincipal = d.principalAmountMinor - repayments.reduce((s, r) => s + r.principalMinor, 0);
  const totalInterestRepaid = repayments.reduce((s, r) => s + r.interestMinor, 0);
  const totalPenaltyRepaid = repayments.reduce((s, r) => s + r.penaltyMinor, 0);

  return (
    <>
      <PageHeader title={getCopy(COPY_KEYS.grow_loan_detail_title)} backHref="/treasurer/loans/active" backLabel={getCopy(COPY_KEYS.grow_loan_detail_backToActive)} />

      {successMessage && (
        <div role="status" style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '8px', fontSize: '0.875rem' }}>
          {successMessage}
        </div>
      )}

      <section style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{getCopy(COPY_KEYS.grow_loan_detail_loanStateHeading)}</h3>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <div style={{ padding: '0.75rem 1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{getCopy(COPY_KEYS.grow_loan_detail_principalLabel)}</span>
            <div style={{ fontWeight: 600 }}>{formatGBP(d.principalAmountMinor)}</div>
          </div>
          <div style={{ padding: '0.75rem 1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{getCopy(COPY_KEYS.grow_loan_detail_totalRepaidLabel)}</span>
            <div style={{ fontWeight: 600 }}>{formatGBP(d.totalRepaidMinor)}</div>
          </div>
          <div style={{ padding: '0.75rem 1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{getCopy(COPY_KEYS.grow_loan_detail_outstandingLabel)}</span>
            <div style={{ fontWeight: 600 }}>{formatGBP(outstanding)}</div>
          </div>
          {(totalInterestRepaid > 0 || totalPenaltyRepaid > 0) && (
            <p style={{ fontSize: '0.8125rem', color: '#6b7280', margin: 0 }}>
              Of repaid: principal {formatGBP(d.totalRepaidMinor - totalInterestRepaid - totalPenaltyRepaid)}
              {totalInterestRepaid > 0 && ` · interest ${formatGBP(totalInterestRepaid)}`}
              {totalPenaltyRepaid > 0 && ` · penalty ${formatGBP(totalPenaltyRepaid)}`}
            </p>
          )}
        </div>
        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>{getCopy(COPY_KEYS.grow_repay_allocationOrderExplainer)}</p>
      </section>

      <section style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{getCopy(COPY_KEYS.grow_loan_detail_ruleSnapshotHeading)}</h3>
        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          {getCopy(COPY_KEYS.grow_ruleSnapshot_interestLabel)}: {d.interestEnabledSnapshot ? getCopy(COPY_KEYS.grow_loan_detail_interestEnabled) : getCopy(COPY_KEYS.grow_loan_detail_interestDisabled)}
          {d.interestEnabledSnapshot && ` · Rate ${(d.interestRateBpsSnapshot / 100).toFixed(2)}%`}
          {d.interestBasisSnapshot && ` · Basis ${d.interestBasisSnapshot}`}
          {' · '}{getCopy(COPY_KEYS.grow_ruleSnapshot_termLabel)} {d.termPeriods} periods · State {d.state}
          {d.ruleVersionIdSnapshot && ` · Rule version ${d.ruleVersionIdSnapshot}`}
        </p>
      </section>

      <section style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>{getCopy(COPY_KEYS.grow_loan_detail_scheduleHeading)}</h3>
        <LoanScheduleTable scheduleItems={d.scheduleItems ?? []} emptyDescription={getCopy(COPY_KEYS.grow_loan_detail_scheduleEmptyDescription)} />
        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>{getCopy(COPY_KEYS.grow_loan_detail_scheduleConfidenceNote)}</p>
      </section>

      <section style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>{getCopy(COPY_KEYS.grow_loan_detail_exceptionHistoryHeading)}</h3>
        <LoanExceptionHistory exceptionEvents={d.exceptionEvents} />
      </section>

      <section style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>{getCopy(COPY_KEYS.grow_loan_detail_repaymentHistoryHeading)}</h3>
        {repayments.length === 0 ? (
          <EmptyState title={getCopy(COPY_KEYS.grow_loan_detail_noRepaymentsYet)} description={getCopy(COPY_KEYS.grow_loan_detail_noRepaymentsDescription)} />
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {repayments.slice().reverse().map((r) => (
              <li key={r.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
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
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {(canWaive || canReschedule || canWriteOff) && d.state === 'ACTIVE' && (
        <section style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{getCopy(COPY_KEYS.grow_loan_detail_actionsHeading)}</h3>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {canWaive && (
              <button type="button" onClick={() => setWaiverOpen(true)} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', cursor: 'pointer' }}>{getCopy(COPY_KEYS.grow_loan_detail_recordWaiver)}</button>
            )}
            {canReschedule && (
              <button type="button" onClick={() => setRescheduleOpen(true)} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', cursor: 'pointer' }}>{getCopy(COPY_KEYS.grow_loan_detail_reschedule)}</button>
            )}
            {canWriteOff && (
              <button type="button" onClick={() => setWriteOffOpen(true)} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', cursor: 'pointer', color: '#b91c1c' }}>{getCopy(COPY_KEYS.grow_loan_detail_writeOff)}</button>
            )}
          </div>
        </section>
      )}

      {canRecordRepayment && d.state === 'ACTIVE' && outstanding > 0 && (
        <p style={{ marginBottom: '1rem' }}>
          <Link
            href={`/treasurer/loans/loan/${params.loanId}/repay`}
            style={{ fontSize: '0.875rem', fontWeight: 500, color: '#2563eb' }}
          >
            {getCopy(COPY_KEYS.grow_loan_detail_recordRepaymentLink)}
          </Link>
        </p>
      )}

      {waiverOpen && (
        <div role="dialog" aria-labelledby="waiver-title" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '1.5rem', maxWidth: '22rem', width: '100%' }}>
            <h2 id="waiver-title" style={{ margin: '0 0 0.5rem', fontSize: '1.125rem', fontWeight: 600 }}>{getCopy(COPY_KEYS.grow_loan_detail_waiverDialogTitle)}</h2>
            <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: '#4b5563' }}>{getCopy(COPY_KEYS.grow_loan_detail_waiverDialogBody)}</p>
            <label htmlFor="waiver-reason" style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Reason (required)</label>
            <textarea id="waiver-reason" value={waiverReason} onChange={(e) => setWaiverReason(e.target.value)} rows={2} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', marginBottom: '1rem' }} />
            {waiverMutation.isError && <p style={{ fontSize: '0.8125rem', color: '#dc2626', marginBottom: '0.5rem' }}>{mapApiErrorToUserMessage(waiverMutation.error)}</p>}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => { setWaiverOpen(false); setWaiverReason(''); }} disabled={waiverMutation.isPending}>Cancel</button>
              <button type="button" onClick={handleWaiverSubmit} disabled={!waiverReason.trim() || waiverMutation.isPending}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {rescheduleOpen && (
        <div role="dialog" aria-labelledby="reschedule-title" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '1.5rem', maxWidth: '22rem', width: '100%' }}>
            <h2 id="reschedule-title" style={{ margin: '0 0 0.5rem', fontSize: '1.125rem', fontWeight: 600 }}>{getCopy(COPY_KEYS.grow_loan_detail_rescheduleDialogTitle)}</h2>
            <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: '#4b5563' }}>{getCopy(COPY_KEYS.grow_loan_detail_rescheduleDialogBody)}</p>
            <label htmlFor="reschedule-reason" style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Reason (required)</label>
            <textarea id="reschedule-reason" value={rescheduleReason} onChange={(e) => setRescheduleReason(e.target.value)} rows={2} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', marginBottom: '0.75rem' }} />
            <label htmlFor="reschedule-term" style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>New term (periods)</label>
            <input id="reschedule-term" type="number" min={1} value={rescheduleTermPeriods} onChange={(e) => setRescheduleTermPeriods(e.target.value)} style={{ width: '100%', padding: '0.5rem', marginBottom: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
            <label htmlFor="reschedule-first-due" style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>First due date</label>
            <input id="reschedule-first-due" type="date" value={rescheduleFirstDue} onChange={(e) => setRescheduleFirstDue(e.target.value)} style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
            {rescheduleMutation.isError && <p style={{ fontSize: '0.8125rem', color: '#dc2626', marginBottom: '0.5rem' }}>{mapApiErrorToUserMessage(rescheduleMutation.error)}</p>}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => { setRescheduleOpen(false); setRescheduleReason(''); setRescheduleTermPeriods(''); setRescheduleFirstDue(''); }} disabled={rescheduleMutation.isPending}>Cancel</button>
              <button type="button" onClick={handleRescheduleSubmit} disabled={!rescheduleReason.trim() || !rescheduleTermPeriods.trim() || !rescheduleFirstDue.trim() || rescheduleMutation.isPending}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {writeOffOpen && (
        <div role="dialog" aria-labelledby="writeoff-title" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '1.5rem', maxWidth: '22rem', width: '100%' }}>
            <h2 id="writeoff-title" style={{ margin: '0 0 0.5rem', fontSize: '1.125rem', fontWeight: 600 }}>{getCopy(COPY_KEYS.grow_loan_detail_writeOffDialogTitle)}</h2>
            <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: '#4b5563' }}>{getCopy(COPY_KEYS.grow_loan_detail_writeOffDialogBody)}</p>
            <label htmlFor="writeoff-reason" style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Reason (required)</label>
            <textarea id="writeoff-reason" value={writeOffReason} onChange={(e) => setWriteOffReason(e.target.value)} rows={2} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', marginBottom: '1rem' }} />
            {writeOffMutation.isError && <p style={{ fontSize: '0.8125rem', color: '#dc2626', marginBottom: '0.5rem' }}>{mapApiErrorToUserMessage(writeOffMutation.error)}</p>}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => { setWriteOffOpen(false); setWriteOffReason(''); }} disabled={writeOffMutation.isPending}>Cancel</button>
              <button type="button" onClick={handleWriteOffSubmit} disabled={!writeOffReason.trim() || writeOffMutation.isPending}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
