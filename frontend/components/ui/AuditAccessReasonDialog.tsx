'use client';

import React, { useCallback, useState } from 'react';
import { tokens } from '@/lib/design-system/tokens';

export interface AuditAccessReasonDialogProps {
  open: boolean;
  title: string;
  /** Warning message (e.g. "Access is logged for audit.") */
  warningMessage: string;
  /** Label for support case / incident ID */
  caseIdLabel?: string;
  caseIdPlaceholder?: string;
  /** Label for reason code or reason selection */
  reasonLabel?: string;
  /** Optional reason options; if not provided, use a text field */
  reasonOptions?: { value: string; label: string }[];
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (payload: { caseId: string; reasonCode: string }) => void;
  onCancel: () => void;
  submitting?: boolean;
}

export function AuditAccessReasonDialog({
  open,
  title,
  warningMessage,
  caseIdLabel = 'Support case or incident ID',
  caseIdPlaceholder = 'e.g. INC-001',
  reasonLabel = 'Reason',
  reasonOptions,
  confirmLabel = 'Continue',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  submitting = false,
}: AuditAccessReasonDialogProps) {
  const [caseId, setCaseId] = useState('');
  const [reasonCode, setReasonCode] = useState(reasonOptions?.[0]?.value ?? '');

  const handleConfirm = useCallback(() => {
    const trimmedCase = caseId.trim();
    if (!trimmedCase || submitting) return;
    onConfirm({ caseId: trimmedCase, reasonCode: reasonCode || trimmedCase });
  }, [caseId, reasonCode, submitting, onConfirm]);

  const canConfirm = caseId.trim().length > 0 && !submitting;

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
      aria-labelledby="audit-access-title"
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
        <h2 id="audit-access-title" style={{ margin: 0, marginBottom: tokens.space[2], fontSize: tokens.font.size.lg, fontWeight: tokens.font.weight.semibold }}>
          {title}
        </h2>
        <div
          style={{
            marginBottom: tokens.space[4],
            padding: tokens.space[3],
            backgroundColor: tokens.semantic.warning.bg,
            color: tokens.semantic.warning.text,
            borderRadius: tokens.radius.md,
            fontSize: tokens.font.size.sm,
            border: `1px solid ${tokens.semantic.warning.border}`,
          }}
          role="alert"
        >
          {warningMessage}
        </div>
        <div style={{ marginBottom: tokens.space[4] }}>
          <label htmlFor="audit-case-id" style={{ display: 'block', fontSize: tokens.font.size.sm, fontWeight: tokens.font.weight.medium, marginBottom: tokens.space[1] }}>
            {caseIdLabel}
          </label>
          <input
            id="audit-case-id"
            type="text"
            value={caseId}
            onChange={(e) => setCaseId(e.target.value)}
            placeholder={caseIdPlaceholder}
            disabled={submitting}
            aria-required="true"
            style={{
              width: '100%',
              padding: `${tokens.space[2]} ${tokens.space[3]}`,
              fontSize: tokens.font.size.base,
              border: `1px solid ${tokens.semantic.border.default}`,
              borderRadius: tokens.radius.md,
              minHeight: tokens.touchTargetMin,
            }}
          />
        </div>
        {reasonOptions && reasonOptions.length > 0 ? (
          <div style={{ marginBottom: tokens.space[4] }}>
            <label htmlFor="audit-reason-code" style={{ display: 'block', fontSize: tokens.font.size.sm, fontWeight: tokens.font.weight.medium, marginBottom: tokens.space[1] }}>
              {reasonLabel}
            </label>
            <select
              id="audit-reason-code"
              value={reasonCode}
              onChange={(e) => setReasonCode(e.target.value)}
              disabled={submitting}
              style={{
                width: '100%',
                padding: `${tokens.space[2]} ${tokens.space[3]}`,
                fontSize: tokens.font.size.base,
                border: `1px solid ${tokens.semantic.border.default}`,
                borderRadius: tokens.radius.md,
                minHeight: tokens.touchTargetMin,
              }}
            >
              {reasonOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        ) : (
          <input type="hidden" value={reasonCode} readOnly />
        )}
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
              color: tokens.semantic.action.primary.text,
              backgroundColor: tokens.semantic.action.primary.bg,
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
