'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { PageHeader, ErrorState, LoadingSkeleton } from '@/components/ui';
import { formatGBP } from '@/lib/format/currency';
import { CurrencyInput } from '@/components/forms';
import { EvidenceField } from '@/components/evidence';
import { validateMinorUnits } from '@/lib/validation/currency';
import { mapApiErrorToUserMessage } from '@/lib/api/errors';
import { useTreasurerGroupId, useRecordLoanRepayment } from '@/lib/api/hooks/treasurer';
import { useLoanDetail, type LoanRepaymentItem } from '@/lib/api/hooks/member';
import { useBeforeUnload } from '@/lib/useBeforeUnload';
import { getCopy, COPY_KEYS } from '@/lib/copy';

const DEMO_MEMBER_ID = process.env.NEXT_PUBLIC_DEMO_MEMBER_ID ?? 'demo-member';
const MIN_AMOUNT_MINOR = 1;

export default function TreasurerLoanRepayPage({ params }: { params: { loanId: string } }) {
  const groupId = useTreasurerGroupId();
  const loan = useLoanDetail(params.loanId, DEMO_MEMBER_ID);
  const recordRepayment = useRecordLoanRepayment(groupId);
  const idempotencyKeyRef = useRef<string | null>(null);

  const [amountMinor, setAmountMinor] = useState(0);
  const [transactionMode, setTransactionMode] = useState<'CASH' | 'BANK_TRANSFER'>('CASH');
  const [evidence, setEvidence] = useState<{ textRef: string; evidenceAttachmentId: string | null }>({ textRef: '', evidenceAttachmentId: null });
  const [amountError, setAmountError] = useState('');
  const [modeError, setModeError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [successAllocation, setSuccessAllocation] = useState<{ principalMinor: number; interestMinor: number; penaltyMinor: number } | null>(null);
  const [alreadyRecorded, setAlreadyRecorded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAmountError('');
    setModeError('');
    const amErr = validateMinorUnits(amountMinor, { min: MIN_AMOUNT_MINOR, required: true });
    if (amErr) {
      setAmountError(amErr);
      return;
    }
    if (!transactionMode) {
      setModeError(getCopy(COPY_KEYS.grow_repay_transactionModeRequired));
      return;
    }
    if (!idempotencyKeyRef.current) idempotencyKeyRef.current = crypto.randomUUID();
    try {
      await recordRepayment.mutateAsync({
        loanId: params.loanId,
        tenantGroupId: groupId,
        amountMinor,
        transactionMode,
        externalReferenceText: evidence.textRef.trim() || undefined,
        evidenceAttachmentId: evidence.evidenceAttachmentId || undefined,
        idempotencyKey: idempotencyKeyRef.current,
      });
      const result = await loan.refetch();
      const repayments: LoanRepaymentItem[] = result.data?.repayments ?? [];
      const last = repayments[repayments.length - 1];
      if (last) setSuccessAllocation({ principalMinor: last.principalMinor, interestMinor: last.interestMinor, penaltyMinor: last.penaltyMinor });
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = mapApiErrorToUserMessage(err);
      if (msg.toLowerCase().includes('already') || (err as { status?: number })?.status === 409) setAlreadyRecorded(true);
    }
  };

  if (loan.isError) {
    return (
      <>
        <PageHeader title={getCopy(COPY_KEYS.grow_repay_title)} backHref={`/treasurer/loans/loan/${params.loanId}`} backLabel={getCopy(COPY_KEYS.grow_repay_backToLoan)} />
        <ErrorState message={getCopy(COPY_KEYS.grow_repay_errorLoadLoan)} onRetry={() => loan.refetch()} />
      </>
    );
  }

  if (loan.isLoading || !loan.data) {
    return (
      <>
        <PageHeader title={getCopy(COPY_KEYS.grow_repay_title)} backHref={`/treasurer/loans/loan/${params.loanId}`} backLabel={getCopy(COPY_KEYS.grow_repay_backToLoan)} />
        <LoadingSkeleton variant="card" />
      </>
    );
  }

  const d = loan.data;
  const repayments: LoanRepaymentItem[] = d.repayments ?? [];
  const outstanding = d.principalAmountMinor - d.totalRepaidMinor;
  const lastRepayment = repayments[repayments.length - 1];
  const allocationFromRefetch = lastRepayment
    ? { principalMinor: lastRepayment.principalMinor, interestMinor: lastRepayment.interestMinor, penaltyMinor: lastRepayment.penaltyMinor }
    : null;
  const allocation = successAllocation ?? allocationFromRefetch;
  const formDirty = !submitted && (amountMinor > 0 || !!evidence.textRef.trim() || !!evidence.evidenceAttachmentId);
  useBeforeUnload(formDirty);

  if (d.state !== 'ACTIVE') {
    return (
      <>
        <PageHeader title={getCopy(COPY_KEYS.grow_repay_title)} backHref={`/treasurer/loans/loan/${params.loanId}`} backLabel={getCopy(COPY_KEYS.grow_repay_backToLoan)} />
        <p style={{ color: '#6b7280' }}>{getCopy(COPY_KEYS.grow_repay_loanNotActive)}</p>
      </>
    );
  }

  if (outstanding <= 0) {
    return (
      <>
        <PageHeader title={getCopy(COPY_KEYS.grow_repay_title)} backHref={`/treasurer/loans/loan/${params.loanId}`} backLabel={getCopy(COPY_KEYS.grow_repay_backToLoan)} />
        <p style={{ color: '#6b7280' }}>{getCopy(COPY_KEYS.grow_repay_noOutstanding)}</p>
      </>
    );
  }

  return (
    <>
      <PageHeader title={getCopy(COPY_KEYS.grow_repay_title)} backHref={`/treasurer/loans/loan/${params.loanId}`} backLabel={getCopy(COPY_KEYS.grow_repay_backToLoan)} />

      <section style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{getCopy(COPY_KEYS.grow_repay_loanSummaryHeading)}</h3>
        <p style={{ margin: '0.25rem 0' }}>{getCopy(COPY_KEYS.grow_repay_outstandingLabel)}: {formatGBP(outstanding)}</p>
        <p style={{ margin: '0.25rem 0', fontSize: '0.8125rem', color: '#6b7280' }}>{getCopy(COPY_KEYS.grow_repay_allocationOrderExplainer)}</p>
      </section>

      {alreadyRecorded && (
        <div role="alert" style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fef3c7', color: '#92400e', borderRadius: '8px', fontSize: '0.875rem' }}>
          {getCopy(COPY_KEYS.grow_repay_duplicateMessage)}
        </div>
      )}

      {submitted && (
        <div role="status" style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '8px', fontSize: '0.875rem' }}>
          {getCopy(COPY_KEYS.grow_repay_success)}
          {allocation && (
            <p style={{ margin: '0.5rem 0 0' }}>
              Allocated: {getCopy(COPY_KEYS.grow_repay_allocatedPrincipal)} {formatGBP(allocation.principalMinor)}
              {allocation.interestMinor > 0 && ` · ${getCopy(COPY_KEYS.grow_repay_allocatedInterest)} ${formatGBP(allocation.interestMinor)}`}
              {allocation.penaltyMinor > 0 && ` · ${getCopy(COPY_KEYS.grow_repay_allocatedPenalty)} ${formatGBP(allocation.penaltyMinor)}`}
            </p>
          )}
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.8125rem', opacity: 0.9 }}>{getCopy(COPY_KEYS.grow_repay_evidenceLinkedNote)}</p>
          <p style={{ marginTop: '0.5rem' }}>
            <Link href={`/treasurer/loans/loan/${params.loanId}`} style={{ fontWeight: 500, color: '#166534' }}>{getCopy(COPY_KEYS.grow_repay_backToLoan)}</Link>
          </p>
        </div>
      )}

      {!submitted && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
          <CurrencyInput
            label={getCopy(COPY_KEYS.grow_repay_amountLabel)}
            valueMinor={amountMinor}
            onChangeMinor={(m) => { setAmountMinor(m); setAmountError(''); }}
            minMinor={MIN_AMOUNT_MINOR}
            error={amountError}
            id="repay-amount"
          />
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="repay-mode" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
              {getCopy(COPY_KEYS.save_transactionMode_label)} <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <select
              id="repay-mode"
              value={transactionMode}
              onChange={(e) => { setTransactionMode(e.target.value as 'CASH' | 'BANK_TRANSFER'); setModeError(''); }}
              style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem' }}
            >
              <option value="CASH">{getCopy(COPY_KEYS.save_transactionMode_cash)}</option>
              <option value="BANK_TRANSFER">{getCopy(COPY_KEYS.save_transactionMode_bank)}</option>
            </select>
            {modeError && <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>{modeError}</p>}
          </div>
          <EvidenceField
            label="Evidence (optional)"
            value={evidence}
            onChange={setEvidence}
            recordSubmitted={false}
            groupId={groupId}
            uploadedByMemberId={DEMO_MEMBER_ID}
            actorMemberId={DEMO_MEMBER_ID}
            textRefPlaceholder="e.g. Bank ref or receipt number"
            textRefHint="Text reference and/or image. You can provide one or both."
          />
          {recordRepayment.isError && (
            <div role="alert" style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '8px', fontSize: '0.875rem' }}>
              {mapApiErrorToUserMessage(recordRepayment.error)}
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="submit"
              disabled={recordRepayment.isPending}
              aria-busy={recordRepayment.isPending}
              aria-label={recordRepayment.isPending ? 'Recording repayment' : 'Record repayment'}
              style={{ minHeight: 44, padding: '0.5rem 1rem', fontWeight: 500, cursor: recordRepayment.isPending ? 'not-allowed' : 'pointer' }}
            >
              {recordRepayment.isPending ? getCopy(COPY_KEYS.grow_repay_recording) : getCopy(COPY_KEYS.grow_repay_recordButton)}
            </button>
            <Link href={`/treasurer/loans/loan/${params.loanId}`} style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Cancel</Link>
          </div>
        </form>
      )}
    </>
  );
}
