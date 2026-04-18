'use client';

import React, { useState, useCallback, useRef } from 'react';
import { TextAreaField } from '@/components/forms';
import { ImagePicker } from '@/components/forms';
import { EvidencePreviewCard } from './EvidencePreviewCard';
import { validateEvidenceImage, uploadAndRegisterEvidence, MAX_EVIDENCE_SIZE_BYTES } from '@/lib/evidence/upload';
import { getCopy, COPY_KEYS } from '@/lib/copy';

export interface EvidenceValue {
  textRef: string;
  evidenceAttachmentId: string | null;
}

export interface EvidenceFieldProps {
  value: EvidenceValue;
  onChange: (v: EvidenceValue) => void;
  /** When true, evidence is locked (record already saved). */
  recordSubmitted?: boolean;
  groupId: string;
  uploadedByMemberId: string;
  actorMemberId: string;
  /** Placeholder for text reference. */
  textRefPlaceholder?: string;
  /** Hint for text reference (e.g. bank transfer or cash receipt examples). */
  textRefHint?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
}

export function EvidenceField({
  value,
  onChange,
  recordSubmitted = false,
  groupId,
  uploadedByMemberId,
  actorMemberId,
  textRefPlaceholder,
  textRefHint,
  label,
  error,
  disabled,
}: EvidenceFieldProps) {
  const lockedMessage = getCopy(COPY_KEYS.save_evidence_lockedExplanation);
  const defaultPlaceholder = getCopy(COPY_KEYS.save_externalRef_placeholder);
  const defaultHint = getCopy(COPY_KEYS.save_externalRef_hintBank) + ' ' + getCopy(COPY_KEYS.save_externalRef_hintCash);
  const defaultLabel = getCopy(COPY_KEYS.save_evidence_label);
  const placeholder = textRefPlaceholder ?? defaultPlaceholder;
  const hint = textRefHint ?? defaultHint;
  const fieldLabel = label ?? defaultLabel;

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localFileName, setLocalFileName] = useState<string | null>(null);
  const [localFileMeta, setLocalFileMeta] = useState<{ mimeType?: string; sizeBytes?: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const locked = recordSubmitted;
  const hasImage = !!value.evidenceAttachmentId || uploading;

  const revokePreview = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [previewUrl]);

  const handleFileSelect = useCallback(
    async (file: File) => {
      const validationError = validateEvidenceImage(file);
      if (validationError) {
        setUploadError(validationError);
        return;
      }
      setUploadError(null);
      setUploading(true);
      setUploadProgress(0);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setLocalFileName(file.name);
      setLocalFileMeta({ mimeType: file.type, sizeBytes: file.size });

      try {
        setUploadProgress(30);
        const { id } = await uploadAndRegisterEvidence(file, {
          groupId,
          uploadedByMemberId,
          actorMemberId,
        });
        setUploadProgress(100);
        onChange({ ...value, evidenceAttachmentId: id });
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Upload failed. Please try again.';
        setUploadError(message);
        revokePreview();
        setPreviewUrl(null);
        setLocalFileName(null);
        setLocalFileMeta(null);
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [groupId, uploadedByMemberId, actorMemberId, value, onChange, revokePreview]
  );

  const handleRemove = useCallback(() => {
    if (locked || uploading) return;
    revokePreview();
    setPreviewUrl(null);
    setLocalFileName(null);
    setLocalFileMeta(null);
    setUploadError(null);
    onChange({ ...value, evidenceAttachmentId: null });
  }, [locked, uploading, value, onChange, revokePreview]);

  const handleReplace = useCallback(() => {
    if (locked || uploading) return;
    fileInputRef.current?.click();
  }, [locked, uploading]);

  const handleTextChange = useCallback(
    (textRef: string) => {
      onChange({ ...value, textRef });
    },
    [value, onChange]
  );

  return (
    <div style={{ marginBottom: '1rem' }} role="group" aria-labelledby={fieldLabel ? 'evidence-field-label' : undefined}>
      {fieldLabel && <p id="evidence-field-label" style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>{fieldLabel}</p>}

      {locked && (
        <p style={{ fontSize: '0.8125rem', color: '#6b7280', marginBottom: '0.75rem', padding: '0.5rem', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
          {lockedMessage}
        </p>
      )}

      {!locked && (
        <>
          <TextAreaField
            id="evidence-textref"
            value={value.textRef}
            onChange={handleTextChange}
            placeholder={placeholder}
            disabled={disabled}
            rows={2}
            maxLength={500}
            label="Text reference"
          />
          {hint && <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '-0.5rem', marginBottom: '0.5rem' }}>{hint}</p>}

          {!hasImage && (
            <ImagePicker
              onSelect={handleFileSelect}
              onError={(msg) => setUploadError(msg)}
              error={uploadError ?? undefined}
              disabled={disabled || uploading}
              label="Attach image (optional)"
              maxSizeBytes={MAX_EVIDENCE_SIZE_BYTES}
            />
          )}
        </>
      )}

      {(value.evidenceAttachmentId || previewUrl || uploading) && (
        <EvidencePreviewCard
          evidenceId={value.evidenceAttachmentId}
          fileName={localFileName ?? undefined}
          mimeType={localFileMeta?.mimeType}
          sizeBytes={localFileMeta?.sizeBytes}
          uploadedAt={value.evidenceAttachmentId ? new Date().toISOString() : undefined}
          previewUrl={previewUrl}
          locked={locked}
          onRemove={locked ? undefined : handleRemove}
          onReplace={locked ? undefined : handleReplace}
          uploading={uploading}
          uploadProgress={uploadProgress}
          error={uploadError}
        />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
          e.target.value = '';
        }}
      />

      {error && <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>{error}</p>}
    </div>
  );
}
