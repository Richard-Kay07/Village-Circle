'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui';
import { SupportAccessGate } from '@/components/support/SupportAccessGate';
import { useSupportAccess } from '@/lib/support/context';
import { useSupportAuditLog, type AuditLogFilters } from '@/lib/api/hooks/support';

function formatDate(v: string): string {
  try {
    return new Date(v).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return v;
  }
}

export default function AdminAuditLogPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { state } = useSupportAccess();

  const [tenantGroupId, setTenantGroupId] = useState('');
  const [entityType, setEntityType] = useState('');
  const [entityId, setEntityId] = useState('');
  const [action, setAction] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    setTenantGroupId(searchParams.get('tenantGroupId') ?? state?.tenantGroupId ?? '');
    setEntityType(searchParams.get('entityType') ?? '');
    setEntityId(searchParams.get('entityId') ?? '');
    setAction(searchParams.get('action') ?? '');
    setFromDate(searchParams.get('fromDate') ?? '');
    setToDate(searchParams.get('toDate') ?? '');
  }, [searchParams, state?.tenantGroupId]);

  const filters: AuditLogFilters & { tenantGroupId: string } = {
    tenantGroupId: tenantGroupId || (state?.tenantGroupId ?? ''),
    entityType: entityType || undefined,
    entityId: entityId || undefined,
    action: action || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    limit: 50,
  };

  const { data, isLoading, error } = useSupportAuditLog(state, filters);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (tenantGroupId) params.set('tenantGroupId', tenantGroupId);
    if (entityType) params.set('entityType', entityType);
    if (entityId) params.set('entityId', entityId);
    if (action) params.set('action', action);
    if (fromDate) params.set('fromDate', fromDate);
    if (toDate) params.set('toDate', toDate);
    router.push(`/admin/audit-log?${params.toString()}`);
  };

  return (
    <>
      <PageHeader title="Audit log" backHref="/admin" backLabel="Back to Support" />
      <SupportAccessGate title="Support access required to view audit log">
        <p style={{ fontSize: '0.8125rem', color: '#6b7280', marginBottom: '1rem' }}>
          Filter state is stored in the URL so you can bookmark or share the current view.
        </p>
        <form
          onSubmit={onSubmit}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem', fontSize: '0.875rem' }}
        >
          <label>
            Tenant group ID *
            <input
              type="text"
              value={tenantGroupId}
              onChange={(e) => setTenantGroupId(e.target.value)}
              placeholder="Required"
              style={{ display: 'block', width: '100%', marginTop: '0.25rem', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
          </label>
          <label>
            Entity type
            <input
              type="text"
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              placeholder="e.g. CONTRIBUTION"
              style={{ display: 'block', width: '100%', marginTop: '0.25rem', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
          </label>
          <label>
            Entity ID
            <input
              type="text"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              placeholder="UUID"
              style={{ display: 'block', width: '100%', marginTop: '0.25rem', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
          </label>
          <label>
            Action
            <input
              type="text"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="e.g. CONTRIBUTION_RECORDED"
              style={{ display: 'block', width: '100%', marginTop: '0.25rem', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
          </label>
          <label>
            From date (ISO)
            <input
              type="text"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              placeholder="YYYY-MM-DD"
              style={{ display: 'block', width: '100%', marginTop: '0.25rem', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
          </label>
          <label>
            To date (ISO)
            <input
              type="text"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              placeholder="YYYY-MM-DD"
              style={{ display: 'block', width: '100%', marginTop: '0.25rem', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
          </label>
          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit" style={{ minHeight: 44, padding: '0.5rem 1rem', fontWeight: 600, cursor: 'pointer' }} aria-label="Apply audit log filters">
              Apply filters
            </button>
          </div>
        </form>

        {error && <p style={{ color: '#b91c1c', fontSize: '0.875rem' }}>{(error as Error).message}</p>}
        {isLoading && <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Loading…</p>}
        {data && !isLoading && (
          <>
            <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>{data.items.length} events (before/after snapshots not shown in this view)</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {data.items.map((e) => (
                <li
                  key={e.id}
                  className="break-word"
                  style={{ fontSize: '0.8125rem', padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}
                >
                  {formatDate(e.createdAt)} · {e.channel} · <strong>{e.action}</strong> · {e.entityType} · {e.entityId}
                  {e.actorUserId && ` · actor ${e.actorUserId}`}
                  {e.reasonCode && ` · reason ${e.reasonCode}`}
                </li>
              ))}
            </ul>
            {data.nextCursor && <p style={{ fontSize: '0.8125rem', color: '#6b7280', marginTop: '0.5rem' }}>More results available (cursor: {data.nextCursor})</p>}
          </>
        )}
      </SupportAccessGate>
    </>
  );
}
