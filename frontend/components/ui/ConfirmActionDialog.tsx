'use client';

import React, { useCallback, useState } from 'react';
import { tokens } from '@/lib/design-system/tokens';

export interface ConfirmActionDialogProps {
  open: boolean;
  title: string;
  /** Main body message */
  body: string;
  /** Consequence text (e.g. "This cannot be undone.") */
  consequenceText?: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
  /** When set, user must check the box to enable confirm (high-risk actions) */
  requireCheckbox?: { label: string };
  onConfirm: () => void;
  onCancel: () => void;
  /** When true, confirm button shows loading and is disabled to prevent duplicate submit */
  confirming?: boolean;
}

export function ConfirmActionDialog({
  open,
  title,
  body,
  consequenceText,
  confirmLabel,
  cancelLabel = 'Cancel',
  variant = 'default',
  requireCheckbox,
  onConfirm,
  onCancel,
  confirming = false,
}: ConfirmActionDialogProps) {
  const [checkboxChecked, setCheckboxChecked] = useState(false);

  const handleClose = useCallback(() => {
    if (!confirming) onCancel();
  }, [confirming, onCancel]);

  const canConfirm = !requireCheckbox || checkboxChecked;
  const isDanger = variant === 'danger';

  if (!open) return null;

  const handleConfirm = () => {
    if (!canConfirm || confirming) return;
    onConfirm();
  };

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
      aria-labelledby="confirm-action-title"
      aria-describedby="confirm-action-body"
    >
      <div
        style={{
          backgroundColor: tokens.semantic.surface.default,
          borderRadius: tokens.radius.lg,
          padding: tokens.space[6],
          maxWidth: '26rem',
          width: '100%',
          boxShadow: tokens.shadow.lg,
        }}
      >
        <h2 id="confirm-action-title" style={{ margin: 0, marginBottom: tokens.space[2], fontSize: tokens.font.size.lg, fontWeight: tokens.font.weight.semibold, color: tokens.semantic.text.primary }}>
          {title}
        </h2>
        <p id="confirm-action-body" style={{ margin: 0, marginBottom: consequenceText ? tokens.space[3] : tokens.space[6], fontSize: tokens.font.size.sm, color: tokens.semantic.text.secondary, lineHeight: 1.5 }}>
          {body}
        </p>
        {consequenceText && (
          <p style={{ margin: 0, marginBottom: tokens.space[6], fontSize: tokens.font.size.sm, color: tokens.semantic.text.muted, fontStyle: 'italic' }}>
            {consequenceText}
          </p>
        )}
        {requireCheckbox && (
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: tokens.space[2], marginBottom: tokens.space[6], cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={checkboxChecked}
              onChange={(e) => setCheckboxChecked(e.target.checked)}
              disabled={confirming}
              aria-describedby="confirm-action-body"
            />
            <span style={{ fontSize: tokens.font.size.sm, color: tokens.semantic.text.secondary }}>{requireCheckbox.label}</span>
          </label>
        )}
        <div style={{ display: 'flex', gap: tokens.space[3], justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={handleClose}
            disabled={confirming}
            style={{
              padding: `${tokens.space[2]} ${tokens.space[4]}`,
              fontSize: tokens.font.size.sm,
              fontWeight: tokens.font.weight.medium,
              color: tokens.semantic.text.secondary,
              backgroundColor: tokens.semantic.surface.muted,
              border: `1px solid ${tokens.semantic.border.default}`,
              borderRadius: tokens.radius.md,
              cursor: confirming ? 'not-allowed' : 'pointer',
              minHeight: tokens.touchTargetMin,
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm || confirming}
            style={{
              padding: `${tokens.space[2]} ${tokens.space[4]}`,
              fontSize: tokens.font.size.sm,
              fontWeight: tokens.font.weight.medium,
              color: tokens.semantic.action.primary.text,
              backgroundColor: isDanger ? tokens.semantic.action.danger.bg : tokens.semantic.action.primary.bg,
              border: 'none',
              borderRadius: tokens.radius.md,
              cursor: canConfirm && !confirming ? 'pointer' : 'not-allowed',
              minHeight: tokens.touchTargetMin,
              opacity: canConfirm && !confirming ? 1 : 0.7,
            }}
          >
            {confirming ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
