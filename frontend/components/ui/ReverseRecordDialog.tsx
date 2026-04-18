'use client';

import React, { useCallback, useState } from 'react';
import { TextAreaField } from '@/components/forms';
import { tokens } from '@/lib/design-system/tokens';

export interface ReverseRecordDialogProps {
  open: boolean;
  title: string;
  /** Immutable explanation copy (e.g. "Reversing creates an audit trail. The original record remains visible but marked reversed.") */
  immutableExplanation: string;
  confirmLabel?: string;
  cancelLabel?: string;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  /** When true, confirm is disabled and button shows progress */
  submitting?: boolean;
}

export function ReverseRecordDialog({
  open,
  title,
  immutableExplanation,
  confirmLabel = 'Reverse record',
  cancelLabel = 'Cancel',
  reasonLabel = 'Reason for reversal (required)',
  reasonPlaceholder = 'Enter reason…',
  onConfirm,
  onCancel,
  submitting = false,
}: ReverseRecordDialogProps) {
  const [reason, setReason] = useState('');

  const handleConfirm = useCallback(() => {
    const trimmed = reason.trim();
    if (!trimmed || submitting) return;
    onConfirm(trimmed);
  }, [reason, submitting, onConfirm]);

  const canConfirm = reason.trim().length > 0 && !submitting;

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: tokens.space[4],
        zIndex: tokens.zIndex.modal,
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reverse-dialog-title"
    >
      <div
        style={{
          backgroundColor: tokens.semantic.surface.default,
          borderRadius: tokens.radius.lg,
          padding: tokens.space[6],
          maxWidth: '28rem',
          width: '100%',
          boxShadow: tokens.shadow.lg,
        }}
      >
        <h2 id="reverse-dialog-title" style={{ margin: 0, marginBottom: tokens.space[2], fontSize: tokens.font.size.lg, fontWeight: tokens.font.weight.semibold }}>
          {title}
        </h2>
        <p style={{ margin: 0, marginBottom: tokens.space[4], fontSize: tokens.font.size.sm, color: tokens.semantic.text.muted, lineHeight: 1.5 }}>
          {immutableExplanation}
        </p>
        <TextAreaField
          id="reverse-reason"
          label={reasonLabel}
          value={reason}
          onChange={setReason}
          placeholder={reasonPlaceholder}
          disabled={submitting}
          rows={3}
          maxLength={500}
        />
        <div style={{ display: 'flex', gap: tokens.space[3], justifyContent: 'flex-end', marginTop: tokens.space[4] }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            style={{
              padding: `${tokens.space[2]} ${tokens.space[4]}`,
              fontSize: tokens.font.size.sm,
              fontWeight: tokens.font.weight.medium,
              color: tokens.semantic.text.secondary,
              backgroundColor: tokens.semantic.surface.muted,
              border: `1px solid ${tokens.semantic.border.default}`,
              borderRadius: tokens.radius.md,
              cursor: submitting ? 'not-allowed' : 'pointer',
              minHeight: tokens.touchTargetMin,
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            style={{
              padding: `${tokens.space[2]} ${tokens.space[4]}`,
              fontSize: tokens.font.size.sm,
              fontWeight: tokens.font.weight.medium,
              color: tokens.semantic.action.danger.text,
              backgroundColor: tokens.semantic.action.danger.bg,
              border: 'none',
              borderRadius: tokens.radius.md,
              cursor: canConfirm ? 'pointer' : 'not-allowed',
              minHeight: tokens.touchTargetMin,
              opacity: canConfirm ? 1 : 0.7,
            }}
          >
            {submitting ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
