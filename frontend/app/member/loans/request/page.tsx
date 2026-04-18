'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { PageHeader } from '@/components/ui';
import { CurrencyInput } from '@/components/forms';
import { formatGBP } from '@/lib/format/currency';
import { validateMinorUnits } from '@/lib/validation/currency';
import { useMemberSession } from '@/lib/member/context';
import { useLoanRuleHints } from '@/lib/api/hooks/member';
import { apiClient } from '@/lib/api/client';
import { mapApiErrorToUserMessage } from '@/lib/api/errors';
import { useBeforeUnload } from '@/lib/useBeforeUnload';
import { getCopy, getCopyTemplate, COPY_KEYS } from '@/lib/copy';

const MIN_AMOUNT_MINOR = 100; // £1
const DEMO_SUBMITTED_BY_USER_ID = process.env.NEXT_PUBLIC_DEMO_USER_ID ?? 'demo-user';

type Step = 'form' | 'confirm';

export default function MemberLoanRequestPage() {
  const router = useRouter();
  const session = useMemberSession();
  const groupId = session?.groupId ?? null;
  const memberId = session?.memberId ?? null;

  const hints = useLoanRuleHints(groupId, memberId);

  const [step, setStep] = useState<Step>('form');
  const [amountMinor, setAmountMinor] = useState<number>(0);
  const [termPeriods, setTermPeriods] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('');
  const [amountError, setAmountError] = useState<string>('');
  const [termError, setTermError] = useState<string>('');
  const [submitError, setSubmitError] = useState<string>('');

  const validateForm = useCallback((): boolean => {
    const amErr = validateMinorUnits(amountMinor, { min: MIN_AMOUNT_MINOR, required: true });
    setAmountError(amErr ?? '');
    const termNum = parseInt(termPeriods, 10);
    const teErr =
      !termPeriods.trim() ? getCopy(COPY_KEYS.grow_loan_request_termErrorRequired) : !Number.isInteger(termNum) || termNum < 1 ? getCopy(COPY_KEYS.grow_loan_request_termErrorInvalid) : '';
    setTermError(teErr);
    return !amErr && !teErr;
  }, [amountMinor, termPeriods]);

  const handleNextToConfirm = () => {
    setSubmitError('');
    if (!validateForm()) return;
    setStep('confirm');
  };

  const submitMutation = useMutation({
    mutationFn: () =>
      apiClient.post<{ id: string }>(
        'loans/applications',
        {
          tenantGroupId: groupId,
          memberProfileId: memberId,
          requestedAmountMinor: amountMinor,
          requestedTermPeriods: parseInt(termPeriods, 10),
          purpose: purpose.trim() || undefined,
          submittedByUserId: DEMO_SUBMITTED_BY_USER_ID,
          actorMemberId: memberId ?? undefined,
        },
        { tenantGroupId: groupId ?? undefined, actorMemberId: memberId ?? undefined }
      ),
    onSuccess: () => {
      router.push('/member/loans?success=1');
    },
    onError: (err) => {
      setSubmitError(mapApiErrorToUserMessage(err));
    },
  });

  const handleConfirmSubmit = () => {
    setSubmitError('');
    submitMutation.mutate();
  };

  const termNum = parseInt(termPeriods, 10);
  const formDirty = step === 'form' && (amountMinor > 0 || !!termPeriods.trim() || !!purpose.trim());
  useBeforeUnload(formDirty);

  if (!groupId || !memberId) {
    return (
      <>
        <PageHeader title={getCopy(COPY_KEYS.grow_loan_request_title)} backHref="/member/loans" backLabel={getCopy(COPY_KEYS.grow_loan_request_backToLoans)} />
        <p style={{ color: '#6b7280' }}>Session required. Go to Dashboard and try again.</p>
      </>
    );
  }

  return (
    <>
      <PageHeader title={getCopy(COPY_KEYS.grow_loan_request_title)} backHref="/member/loans" backLabel={getCopy(COPY_KEYS.grow_loan_request_backToLoans)} />

      {step === 'form' && (
        <>
          {hints.data && (
            <section style={{ marginBottom: '1.25rem', padding: '0.75rem', backgroundColor: '#f0f9ff', borderRadius: '8px', fontSize: '0.875rem' }}>
              <strong style={{ display: 'block', marginBottom: '0.25rem' }}>{getCopy(COPY_KEYS.grow_loan_request_groupPolicyHeading)}</strong>
              <p style={{ margin: 0, color: '#0c4a6e' }}>
                {hints.data.loanInterestEnabled
                  ? getCopyTemplate(COPY_KEYS.grow_interest_mayApply, { rate: (hints.data.loanInterestRateBps / 100).toFixed(2) })
                  : getCopy(COPY_KEYS.grow_interest_doesNotApply)}
              </p>
            </section>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleNextToConfirm();
            }}
            style={{ marginBottom: '1.5rem' }}
          >
            <CurrencyInput
              label={getCopy(COPY_KEYS.grow_loan_request_amountLabel)}
              valueMinor={amountMinor}
              onChangeMinor={(m) => {
                setAmountMinor(m);
                setAmountError('');
              }}
              minMinor={MIN_AMOUNT_MINOR}
              error={amountError}
              id="loan-amount"
            />
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="loan-term" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                {getCopy(COPY_KEYS.grow_loan_request_termLabel)}
              </label>
              <input
                id="loan-term"
                type="number"
                min={1}
                step={1}
                value={termPeriods}
                onChange={(e) => {
                  setTermPeriods(e.target.value);
                  setTermError('');
                }}
                placeholder={getCopy(COPY_KEYS.grow_loan_request_termPlaceholder)}
                style={{
                  width: '100%',
                  minHeight: 44,
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem',
                }}
              />
              {termError && <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>{termError}</p>}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="loan-purpose" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                {getCopy(COPY_KEYS.grow_loan_request_purposeLabel)}
              </label>
              <textarea
                id="loan-purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder={getCopy(COPY_KEYS.grow_loan_request_purposePlaceholder)}
                rows={2}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  resize: 'vertical',
                }}
              />
            </div>
            <button type="submit" style={{ minHeight: 44, padding: '0.5rem 1rem', fontSize: '1rem', fontWeight: 500, cursor: 'pointer' }} aria-label="Continue to confirmation">
              {getCopy(COPY_KEYS.grow_loan_request_continue)}
            </button>
          </form>
        </>
      )}

      {step === 'confirm' && (
        <>
          <section style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>{getCopy(COPY_KEYS.grow_loan_request_confirmHeading)}</h3>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Amount:</strong> {formatGBP(amountMinor)}
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Term:</strong> {termNum} period{termNum !== 1 ? 's' : ''}
            </p>
            {purpose.trim() && (
              <p style={{ marginBottom: 0 }}>
                <strong>Note:</strong> {purpose.trim()}
              </p>
            )}
          </section>

          {submitError && (
            <div role="alert" style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '8px', fontSize: '0.875rem' }}>
              {submitError}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setStep('form')}
              disabled={submitMutation.isPending}
              style={{ minHeight: 44, padding: '0.5rem 1rem', fontSize: '0.875rem', cursor: 'pointer' }}
              aria-label="Back to edit application"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleConfirmSubmit}
              disabled={submitMutation.isPending}
              aria-busy={submitMutation.isPending}
              aria-label={submitMutation.isPending ? 'Submitting application' : 'Submit application'}
              style={{ minHeight: 44, padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 500, cursor: submitMutation.isPending ? 'not-allowed' : 'pointer' }}
            >
              {submitMutation.isPending ? getCopy(COPY_KEYS.grow_loan_request_submitting) : getCopy(COPY_KEYS.grow_loan_request_submit)}
            </button>
          </div>
        </>
      )}
    </>
  );
}
