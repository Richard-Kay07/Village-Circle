'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui';
import { SupportAccessGate } from '@/components/support/SupportAccessGate';
import { useSupportAccess } from '@/lib/support/context';
import { useContributionTrace, useLoanTrace, type EntityTrace } from '@/lib/api/hooks/support';
import { formatGBP } from '@/lib/format';
import Link from 'next/link';

function formatDate(v: string | Date): string {
  try {
    return new Date(v).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return String(v);
  }
}

function TraceView({ trace }: { trace: EntityTrace }) {
  const isLoan = trace.entityType === 'LOAN';
  return (
    <div style={{ marginTop: '1.5rem' }}>
      <p style={{ fontSize: '0.8125rem', color: '#92400e', backgroundColor: '#fef3c7', padding: '0.5rem 0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>
        Financial corrections must use reversal or adjustment workflows. This screen is read-only; no edit actions.
      </p>

      <section style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Entity</h3>
        <pre style={{ fontSize: '0.8125rem', padding: '0.75rem', backgroundColor: '#f3f4f6', borderRadius: '6px', overflow: 'auto', maxHeight: 200 }}>
          {JSON.stringify(trace.entity, null, 2)}
        </pre>
      </section>

      {isLoan && 'scheduleItems' in trace && trace.scheduleItems.length > 0 && (
        <section style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Schedule items</h3>
          <pre style={{ fontSize: '0.8125rem', padding: '0.75rem', backgroundColor: '#f3f4f6', borderRadius: '6px', overflow: 'auto', maxHeight: 180 }}>
            {JSON.stringify(trace.scheduleItems, null, 2)}
          </pre>
        </section>
      )}

      {isLoan && 'repayments' in trace && trace.repayments.length > 0 && (
        <section style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Repayments</h3>
          <pre style={{ fontSize: '0.8125rem', padding: '0.75rem', backgroundColor: '#f3f4f6', borderRadius: '6px', overflow: 'auto', maxHeight: 180 }}>
            {JSON.stringify(trace.repayments, null, 2)}
          </pre>
        </section>
      )}

      <section style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Ledger events</h3>
        {trace.ledgerEvents.length === 0 ? (
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>None</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {trace.ledgerEvents.map((e) => (
              <li key={e.id} className="break-word" style={{ fontSize: '0.875rem', padding: '0.35rem 0', borderBottom: '1px solid #e5e7eb' }}>
                {e.id} · {e.sourceEventType} · {e.sourceEventId} · {formatDate(e.eventTimestamp)}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Ledger lines</h3>
        {trace.ledgerLines.length === 0 ? (
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>None</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {trace.ledgerLines.map((l, i) => (
              <li key={`${l.ledgerEventId}-${i}`} style={{ fontSize: '0.875rem', padding: '0.35rem 0', borderBottom: '1px solid #e5e7eb' }}>
                {l.ledgerEventId} · {l.fundBucket} · {l.memberId ?? '—'} · {formatGBP(l.amountMinor)}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Audit events</h3>
        {trace.auditEvents.length === 0 ? (
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>None</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {trace.auditEvents.map((e) => (
              <li key={e.id} className="break-word" style={{ fontSize: '0.875rem', padding: '0.35rem 0', borderBottom: '1px solid #e5e7eb' }}>
                #{e.sequenceNo} · {e.action} · {e.entityType} · {e.entityId} · {formatDate(e.createdAt)}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Evidence metadata</h3>
        {trace.evidenceMetadata.length === 0 ? (
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>None</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {trace.evidenceMetadata.map((m) => (
              <li key={m.id} style={{ fontSize: '0.875rem', padding: '0.35rem 0', borderBottom: '1px solid #e5e7eb' }}>
                <Link href={`/admin/evidence/${m.id}`} style={{ color: '#2563eb' }}>{m.id}</Link> · {m.mimeType} · {m.sizeBytes} B
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Notifications</h3>
        {trace.notifications.length === 0 ? (
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>None</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {trace.notifications.map((n) => (
              <li key={n.id} style={{ fontSize: '0.875rem', padding: '0.35rem 0', borderBottom: '1px solid #e5e7eb' }}>
                {n.id} · {n.channel} · {n.templateKey} · <strong>{n.status}</strong> · {formatDate(n.createdAt)}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function AdminTracesPage() {
  const { state } = useSupportAccess();
  const [entityType, setEntityType] = useState<'CONTRIBUTION' | 'LOAN'>('CONTRIBUTION');
  const [entityId, setEntityId] = useState('');
  const [tenantGroupId, setTenantGroupId] = useState(state?.tenantGroupId ?? '');
  useEffect(() => {
    if (state?.tenantGroupId && !tenantGroupId) setTenantGroupId(state.tenantGroupId);
  }, [state?.tenantGroupId]);
  const [submitted, setSubmitted] = useState<{ type: 'CONTRIBUTION' | 'LOAN'; id: string; tenant: string } | null>(null);

  const contribTrace = useContributionTrace(
    state,
    submitted?.type === 'CONTRIBUTION' ? submitted.id : null,
    submitted?.tenant ?? ''
  );
  const loanTrace = useLoanTrace(
    state,
    submitted?.type === 'LOAN' ? submitted.id : null,
    submitted?.tenant ?? ''
  );

  const traceData = submitted?.type === 'CONTRIBUTION' ? contribTrace.data : loanTrace.data;
  const isLoading = submitted?.type === 'CONTRIBUTION' ? contribTrace.isLoading : loanTrace.isLoading;
  const error = submitted?.type === 'CONTRIBUTION' ? contribTrace.error : loanTrace.error;

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const id = entityId.trim();
    const tenant = tenantGroupId.trim();
    if (!id || !tenant) return;
    setSubmitted({ type: entityType, id, tenant });
  };

  return (
    <>
      <PageHeader title="Entity traces" backHref="/admin" backLabel="Back to Support" />
      <SupportAccessGate title="Support access required to view traces">
        <form onSubmit={onSearch} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 400, marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>
            Entity type
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value as 'CONTRIBUTION' | 'LOAN')}
              style={{ display: 'block', width: '100%', marginTop: '0.25rem', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            >
              <option value="CONTRIBUTION">Contribution</option>
              <option value="LOAN">Loan</option>
            </select>
          </label>
          <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>
            Entity ID
            <input
              type="text"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              placeholder="UUID"
              style={{ display: 'block', width: '100%', marginTop: '0.25rem', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
          </label>
          <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>
            Tenant group ID
            <input
              type="text"
              value={tenantGroupId}
              onChange={(e) => setTenantGroupId(e.target.value)}
              placeholder="Group UUID"
              style={{ display: 'block', width: '100%', marginTop: '0.25rem', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
          </label>
          <button type="submit" style={{ minHeight: 44, padding: '0.5rem 1rem', fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start' }} aria-label="Load entity trace">
            View trace
          </button>
        </form>

        {error && (
          <p style={{ color: '#b91c1c', fontSize: '0.875rem' }}>{(error as Error).message}</p>
        )}
        {isLoading && <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Loading trace…</p>}
        {traceData && !isLoading && <TraceView trace={traceData} />}
      </SupportAccessGate>
    </>
  );
}
