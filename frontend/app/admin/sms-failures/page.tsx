'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui';
import { SupportAccessGate } from '@/components/support/SupportAccessGate';
import { useSupportAccess } from '@/lib/support/context';
import { useSupportSmsFailures, useRetryNotification } from '@/lib/api/hooks/support';
import { useCapabilities } from '@/lib/context/capabilities-context';

function formatDate(v: string): string {
  try {
    return new Date(v).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return v;
  }
}

export default function AdminSmsFailuresPage() {
  const { state } = useSupportAccess();
  const [tenantFilter, setTenantFilter] = useState(state?.tenantGroupId ?? '');
  const capabilities = useCapabilities();
  const canRetry = capabilities.includes('notification.resend');

  const { data, isLoading, error, refetch } = useSupportSmsFailures(state, {
    tenantGroupId: tenantFilter || undefined,
    limit: 50,
  });
  const retryMutation = useRetryNotification(state);

  return (
    <>
      <PageHeader title="SMS failures" backHref="/admin" backLabel="Back to Support" />
      <SupportAccessGate title="Support access required to view SMS failures">
        <label style={{ display: 'block', marginBottom: '1rem', fontSize: '0.875rem' }}>
          Tenant group ID (optional filter)
          <input
            type="text"
            value={tenantFilter}
            onChange={(e) => setTenantFilter(e.target.value)}
            placeholder="Leave empty for all"
            style={{ display: 'block', width: '100%', maxWidth: 320, marginTop: '0.25rem', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
          />
        </label>
        <button type="button" onClick={() => refetch()} style={{ marginBottom: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
          Refresh
        </button>

        {error && <p style={{ color: '#b91c1c', fontSize: '0.875rem' }}>{(error as Error).message}</p>}
        {isLoading && <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Loading…</p>}
        {data && !isLoading && (
          <>
            <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>{data.items.length} failed notification(s)</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {data.items.map((item) => (
                <li
                  key={item.id}
                  style={{ fontSize: '0.875rem', padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}
                >
                  <span>{formatDate(item.createdAt)}</span>
                  <span>{item.templateKey}</span>
                  <span>{item.tenantGroupId}</span>
                  <span title={item.errorMessage ?? ''}>{item.errorCode ?? item.status}</span>
                  {canRetry && (
                    <button
                      type="button"
                      onClick={() => retryMutation.mutate(item.id)}
                      disabled={retryMutation.isPending}
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8125rem', cursor: 'pointer' }}
                    >
                      Retry
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {data.nextCursor && <p style={{ fontSize: '0.8125rem', color: '#6b7280', marginTop: '0.5rem' }}>More results available</p>}
          </>
        )}
      </SupportAccessGate>
    </>
  );
}
