'use client';

import React, { useCallback } from 'react';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const handleConfirm = useCallback(() => {
    onConfirm();
  }, [onConfirm]);
  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  if (!open) return null;

  const isDanger = variant === 'danger';

  return (
    <div className="confirm-dialog-overlay" style={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
      <div className="confirm-dialog" style={styles.dialog}>
        <h2 id="confirm-dialog-title" style={styles.title}>
          {title}
        </h2>
        <p style={styles.message}>{message}</p>
        <div style={styles.actions}>
          <button
            type="button"
            onClick={handleCancel}
            className="confirm-dialog__cancel"
            style={styles.cancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="confirm-dialog__confirm"
            style={{
              ...styles.confirm,
              ...(isDanger ? styles.confirmDanger : {}),
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    zIndex: 1000,
  },
  dialog: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '1.5rem',
    maxWidth: '22rem',
    width: '100%',
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
  },
  title: {
    margin: '0 0 0.5rem',
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#111',
  },
  message: {
    margin: '0 0 1.25rem',
    fontSize: '0.875rem',
    color: '#4b5563',
    lineHeight: 1.5,
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'flex-end',
  },
  cancel: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#374151',
    backgroundColor: '#f3f4f6',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  confirm: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#fff',
    backgroundColor: '#2563eb',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  confirmDanger: {
    backgroundColor: '#dc2626',
  },
};
