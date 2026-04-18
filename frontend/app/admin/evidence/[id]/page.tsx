'use client';

import React from 'react';
import { PageHeader } from '@/components/ui';
import { SupportAccessGate } from '@/components/support/SupportAccessGate';
import { useSupportAccess } from '@/lib/support/context';
import { useSupportEvidence } from '@/lib/api/hooks/support';
import { getCopy, COPY_KEYS } from '@/lib/copy';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return '—';
  }
}

export default function AdminEvidencePage({ params }: { params: { id: string } }) {
  const { state } = useSupportAccess();
  const { data, isLoading, error, isError } = useSupportEvidence(state, params.id);

  return (
    <>
      <PageHeader title="Evidence (support view)" backHref="/admin/traces" backLabel="Back to traces" />
      <SupportAccessGate title={getCopy(COPY_KEYS.legal_supportEvidence_gateTitle)}>
        <div style={{ padding: '0.75rem', backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem' }}>
          {getCopy(COPY_KEYS.legal_supportEvidence_auditedBanner)}
        </div>
        {isLoading && <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Loading…</p>}
        {isError && (
          <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', borderRadius: '8px', fontSize: '0.875rem' }}>
            <p style={{ margin: 0, color: '#991b1b' }}>
              {(error as Error & { status?: number })?.status === 403 || (error as Error & { code?: string })?.code === 'FORBIDDEN_ERROR'
                ? getCopy(COPY_KEYS.legal_supportEvidence_accessDenied)
                : (error as Error).message}
            </p>
          </div>
        )}
        {data && !isLoading && (
          <div style={{ fontSize: '0.875rem' }}>
            <p><strong>Evidence ID:</strong> {data.id}</p>
            <p><strong>MIME type:</strong> {data.mimeType ?? '—'}</p>
            <p><strong>Size:</strong> {data.sizeBytes != null ? formatSize(data.sizeBytes) : '—'}</p>
            <p><strong>Created:</strong> {formatTime(data.createdAt)}</p>
            <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>File content is not displayed here; this view shows metadata only for audit trail.</p>
          </div>
        )}
      </SupportAccessGate>
    </>
  );
}
