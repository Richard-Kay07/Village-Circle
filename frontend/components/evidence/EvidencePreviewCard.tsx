'use client';

import React from 'react';

export interface EvidencePreviewCardProps {
  /** Uploaded file id (from register). */
  evidenceId: string | null;
  /** Original file name for display. */
  fileName?: string;
  /** Mime type. */
  mimeType?: string;
  /** Size in bytes. */
  sizeBytes?: number;
  /** Uploaded at (ISO string or Date). */
  uploadedAt?: string | null;
  /** Object URL for preview (revoke when unmounting). */
  previewUrl?: string | null;
  /** Whether the record is already saved (no replace/remove). */
  locked?: boolean;
  /** Callback when user requests remove (only when !locked). */
  onRemove?: () => void;
  /** Callback when user requests replace (only when !locked). */
  onReplace?: () => void;
  /** Upload in progress. */
  uploading?: boolean;
  /** Progress 0–100. */
  uploadProgress?: number;
  /** Error message. */
  error?: string | null;
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
 * Card showing uploaded evidence preview and metadata. Supports remove/replace when not locked.
 */
export function EvidencePreviewCard({
  evidenceId,
  fileName,
  mimeType,
  sizeBytes,
  uploadedAt,
  previewUrl,
  locked,
  onRemove,
  onReplace,
  uploading,
  uploadProgress = 0,
  error,
}: EvidencePreviewCardProps) {
  const showPreview = previewUrl && !uploading;
  const canEdit = !locked && !uploading;

  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#fff',
      }}
    >
      {showPreview && (
        <div style={{ padding: '0.5rem', backgroundColor: '#f9fafb', textAlign: 'center' }}>
          <img
            src={previewUrl}
            alt={fileName ?? 'Evidence'}
            style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
          />
        </div>
      )}
      {uploading && (
        <div style={{ padding: '1rem' }} aria-live="polite" aria-busy="true">
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Uploading… {uploadProgress > 0 && uploadProgress < 100 ? `${uploadProgress}%` : ''}</p>
          <div style={{ height: 6, backgroundColor: '#e5e7eb', borderRadius: 3, marginTop: '0.5rem', overflow: 'hidden' }}>
            <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: '#2563eb', transition: 'width 0.2s' }} />
          </div>
        </div>
      )}
      <div style={{ padding: '0.75rem 1rem' }}>
        {fileName && <p style={{ margin: '0 0 0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>{fileName}</p>}
        {mimeType && <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>{mimeType}</p>}
        {sizeBytes != null && <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>{formatSize(sizeBytes)}</p>}
        {uploadedAt && <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>Uploaded: {formatTime(uploadedAt)}</p>}
        {error && <p style={{ margin: '0.5rem 0 0', fontSize: '0.8125rem', color: '#dc2626' }}>{error}</p>}
        {canEdit && (evidenceId || showPreview) && (
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            {onReplace && <button type="button" onClick={onReplace} style={{ minHeight: 44, padding: '0.5rem 0.75rem', fontSize: '0.875rem', cursor: 'pointer' }}>Replace</button>}
            {onRemove && <button type="button" onClick={onRemove} style={{ minHeight: 44, padding: '0.5rem 0.75rem', fontSize: '0.875rem', color: '#dc2626', cursor: 'pointer', background: 'none', border: 'none' }}>Remove</button>}
          </div>
        )}
      </div>
    </div>
  );
}
