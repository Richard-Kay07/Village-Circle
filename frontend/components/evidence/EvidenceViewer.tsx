'use client';

import React from 'react';

export interface EvidenceViewerProps {
  /** Text reference if present. */
  textRef?: string | null;
  /** Evidence file id if image attached. */
  evidenceId?: string | null;
  /** Metadata from API (when available). */
  metadata?: {
    id: string;
    mimeType?: string;
    sizeBytes?: number;
    createdAt?: string | null;
    storedPath?: string;
  } | null;
  /** True when user has no access to view this evidence. */
  restricted?: boolean;
  /** For admin/support: show reason-code prompt (e.g. link or button to view with reason). */
  showSupportPrompt?: boolean;
  onSupportView?: () => void;
}

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

/**
 * Displays evidence metadata and optional image preview access. Shows restricted notice when user lacks access.
 */
export function EvidenceViewer({
  textRef,
  evidenceId,
  metadata,
  restricted = false,
  showSupportPrompt = false,
  onSupportView,
}: EvidenceViewerProps) {
  const hasText = !!textRef?.trim();
  const hasImage = !!evidenceId;

  if (!hasText && !hasImage) {
    return <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>No evidence recorded.</p>;
  }

  if (restricted) {
    return (
      <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', borderRadius: '8px', fontSize: '0.875rem' }}>
        <p style={{ margin: 0, color: '#991b1b' }}>You do not have access to view this evidence.</p>
        {showSupportPrompt && onSupportView && (
          <button type="button" onClick={onSupportView} style={{ marginTop: '0.5rem', minHeight: 44, padding: '0.5rem 0.75rem', fontSize: '0.875rem', cursor: 'pointer' }}>
            View as support (reason code required)
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ fontSize: '0.875rem' }}>
      {hasText && (
        <div style={{ marginBottom: '0.5rem' }}>
          <strong>Text reference:</strong>
          <p style={{ margin: '0.25rem 0 0', color: '#374151', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{textRef}</p>
        </div>
      )}
      {hasImage && (
        <div style={{ marginTop: hasText ? '0.75rem' : 0 }}>
          <strong>Image</strong>
          {metadata ? (
            <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem', color: '#6b7280' }}>
              <li>Type: {metadata.mimeType ?? '—'}</li>
              <li>Size: {metadata.sizeBytes != null ? formatSize(metadata.sizeBytes) : '—'}</li>
              <li>Uploaded: {formatTime(metadata.createdAt)}</li>
            </ul>
          ) : (
            <p style={{ margin: '0.25rem 0 0', color: '#6b7280' }}>Image attached. Metadata not loaded.</p>
          )}
        </div>
      )}
    </div>
  );
}
