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
  useLoanApplicationDetail,
  useApproveLoanApplication,
  useRejectLoanApplication,
} from '@/lib/api/hooks/treasurer';
import { getCopy, COPY_KEYS } from '@/lib/copy';

function formatInterestRateBps(bps: number): string {
  return `${(bps / 100).toFixed(2)}%`;
}

export default function TreasurerLoanApplicationDetailPage({ params }: { params: { id: string } }) {
  const groupId = useTreasurerGroupId();
  const detail = useLoanApplicationDetail(params.id, groupId);
  const approveMutation = useApproveLoanApplication(groupId);
  const rejectMutation = useRejectLoanApplication(groupId);
  const canApprove = useCapabilities().includes('loan.approve');

  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [notificationNote, setNotificationNote] = useState<string | null>(null);

  const handleApproveClick = () => setShowApproveConfirm(true);
  const handleRejectClick = () => setShowRejectConfirm(true);

  const handleApproveConfirm = async () => {
    if (!params.id) return;
    setSuccessMessage(null);
    setNotificationNote(null);
    try {
      const res = await approveMutation.mutateAsync(params.id);
      setShowApproveConfirm(false);
      setSuccessMessage(getCopy(COPY_KEYS.hub_approval_applicationApproved));
      setNotificationNote(getCopy(COPY_KEYS.hub_approval_applicantNotified));
      detail.refetch();
    } catch (err) {
      // Error shown below
    }
  };

  const handleRejectConfirm = async () => {
    if (!params.id) return;
    setSuccessMessage(null);
    setNotificationNote(null);
    try {
      await rejectMutation.mutateAsync(params.id);
      setShowRejectConfirm(false);
      setSuccessMessage(getCopy(COPY_KEYS.hub_approval_applicationRejected));
      setNotificationNote(getCopy(COPY_KEYS.hub_approval_applicantNotified));
      detail.refetch();
    } catch (err) {
      // Error shown below
    }
  };

  const approveError = approveMutation.isError ? mapApiErrorToUserMessage(approveMutation.error) : null;
  const rejectError = rejectMutation.isError ? mapApiErrorToUserMessage(rejectMutation.error) : null;

  if (detail.isError) {
    return (
      <>
        <PageHeader title="Loan application" backHref="/treasurer/loans" backLabel={getCopy(COPY_KEYS.hub_backToLoans)} />
        <ErrorState message={getCopy(COPY_KEYS.hub_errorLoadApplication)} onRetry={() => detail.refetch()} />
      </>
    );
  }

  if (detail.isLoading || !detail.data) {
    return (
      <>
        <PageHeader title="Loan application" backHref="/treasurer/loans" backLabel="Back to Loans" />
        <LoadingSkeleton variant="card" />
      </>
    );
  }

  const app = detail.data;
  const isPending = app.status === 'SUBMITTED';
  const snapshot = app.ruleSnapshot;

  return (
    <>
      <PageHeader title="Loan application" backHref="/treasurer/loans" backLabel="Back to Loans" />

      {successMessage && (
        <div
          role="status"
          style={{
            marginBottom: '1rem',
            padding: '0.75rem',
            backgroundColor: '#dcfce7',
            color: '#166534',
            borderRadius: '8px',
            fontSize: '0.875rem',
          }}
        >
          {successMessage}
          {notificationNote && (
            <span style={{ display: 'block', marginTop: '0.25rem', opacity: 0.9 }}>{notificationNote}</span>
          )}
        </div>
      )}

      <section style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Applicant</h3>
        <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <p style={{ margin: 0 }}><strong>{app.member.displayName}</strong></p>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#6b7280' }}>Member ID: {app.memberId}</p>
        </div>
      </section>

      <section style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Request details</h3>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <div style={{ padding: '0.75rem 1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Amount</span>
            <div style={{ fontWeight: 600 }}>{formatGBP(app.requestedAmountMinor)}</div>
          </div>
          <div style={{ padding: '0.75rem 1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Term</span>
            <div style={{ fontWeight: 500 }}>{app.requestedTermPeriods} period{app.requestedTermPeriods !== 1 ? 's' : ''}</div>
          </div>
          <div style={{ padding: '0.75rem 1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Submitted</span>
            <div style={{ fontWeight: 500 }}>{formatUKDate(app.submittedAt)}</div>
          </div>
          {app.purpose && (
            <div style={{ padding: '0.75rem 1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Purpose / note</span>
              <div style={{ fontWeight: 500 }}>{app.purpose}</div>
            </div>
          )}
          <div style={{ padding: '0.75rem 1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Status</span>
            <div style={{ fontWeight: 500 }}>{app.status}</div>
          </div>
        </div>
      </section>

      {snapshot && (
        <section style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Current group rules (if you approve)</h3>
          <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
            <strong>Interest:</strong> {snapshot.loanInterestEnabled ? 'Yes' : 'No'}
            {snapshot.loanInterestEnabled && ` · Rate: ${formatInterestRateBps(snapshot.loanInterestRateBps)} · Basis: ${snapshot.loanInterestBasis}`}
          </p>
          <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
            <strong>Term:</strong> {app.requestedTermPeriods} period{app.requestedTermPeriods !== 1 ? 's' : ''}
          </p>
        </section>
      )}

      {isPending && !canApprove && (
        <section style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{getCopy(COPY_KEYS.hub_approval_viewOnlyHeading)}</h3>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>{getCopy(COPY_KEYS.hub_approval_viewOnlyDescription)}</p>
        </section>
      )}

      {isPending && canApprove && (
        <section style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{getCopy(COPY_KEYS.hub_approval_queue_heading)}</h3>
          {(approveError || rejectError) && (
            <div
              role="alert"
              style={{
                marginBottom: '0.75rem',
                padding: '0.75rem',
                backgroundColor: '#fef2f2',
                color: '#b91c1c',
                borderRadius: '8px',
                fontSize: '0.875rem',
              }}
            >
              {approveError || rejectError}
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleApproveClick}
              disabled={approveMutation.isPending || rejectMutation.isPending}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#16a34a',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              {getCopy(COPY_KEYS.hub_approval_approveLoan)}
            </button>
            <button
              type="button"
              onClick={handleRejectClick}
              disabled={approveMutation.isPending || rejectMutation.isPending}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#dc2626',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              {getCopy(COPY_KEYS.hub_approval_rejectLoan)}
            </button>
          </div>
        </section>
      )}

      {!isPending && (
        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          This application has already been {app.status.toLowerCase()}. No further actions available.
        </p>
      )}

      {showApproveConfirm && (
        <div
          role="dialog"
          aria-labelledby="approve-dialog-title"
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
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '1.5rem', maxWidth: '28rem', width: '100%' }}>
            <h2 id="approve-dialog-title" style={{ margin: '0 0 0.5rem', fontSize: '1.125rem', fontWeight: 600 }}>
              Approve application
            </h2>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', color: '#4b5563' }}>
              This will create the loan and schedule using the current group rules. The applicant will be notified.
            </p>
            {snapshot && (
              <div style={{ marginBottom: '0.75rem', padding: '0.75rem', backgroundColor: '#f0f9ff', borderRadius: '6px', fontSize: '0.875rem' }}>
                <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Resulting terms</strong>
                <p style={{ margin: '0.25rem 0' }}>Interest: {snapshot.loanInterestEnabled ? 'Yes' : 'No'}</p>
                {snapshot.loanInterestEnabled && (
                  <>
                    <p style={{ margin: '0.25rem 0' }}>Rate: {formatInterestRateBps(snapshot.loanInterestRateBps)}</p>
                    <p style={{ margin: '0.25rem 0' }}>Basis: {snapshot.loanInterestBasis}</p>
                  </>
                )}
                <p style={{ margin: '0.25rem 0' }}>Term: {app.requestedTermPeriods} period{app.requestedTermPeriods !== 1 ? 's' : ''}</p>
              </div>
            )}
            <p style={{ margin: '0 0 1rem', fontSize: '0.8125rem', color: '#6b7280' }}>
              Future changes to group rules will not apply to this loan unless it is rescheduled.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowApproveConfirm(false)}
                disabled={approveMutation.isPending}
                style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApproveConfirm}
                disabled={approveMutation.isPending}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#16a34a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                {approveMutation.isPending ? 'Approving…' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectConfirm && (
        <div
          role="dialog"
          aria-labelledby="reject-dialog-title"
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
            <h2 id="reject-dialog-title" style={{ margin: '0 0 0.5rem', fontSize: '1.125rem', fontWeight: 600 }}>
              Reject application
            </h2>
            <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: '#4b5563' }}>
              Rejecting will notify the applicant. This cannot be undone.
            </p>
            {rejectError && (
              <p style={{ margin: '0 0 0.75rem', fontSize: '0.8125rem', color: '#dc2626' }}>{rejectError}</p>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowRejectConfirm(false)}
                disabled={rejectMutation.isPending}
                style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                disabled={rejectMutation.isPending}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                {rejectMutation.isPending ? 'Rejecting…' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
