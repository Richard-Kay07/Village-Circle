'use client';

import React from 'react';
import { tokens } from '@/lib/design-system/tokens';

export type TransactionMode = 'CASH' | 'BANK_TRANSFER';

export interface TransactionModeSelectorProps {
  value: TransactionMode;
  onChange: (mode: TransactionMode) => void;
  label?: string;
  cashLabel?: string;
  bankLabel?: string;
  disabled?: boolean;
  id?: string;
  error?: string;
}

/**
 * Accessible segmented control / radio group for Cash vs Bank transfer.
 */
export function TransactionModeSelector({
  value,
  onChange,
  label = 'Transaction mode',
  cashLabel = 'Cash',
  bankLabel = 'Bank transfer',
  disabled,
  id = 'transaction-mode',
  error,
}: TransactionModeSelectorProps) {
  const groupId = `${id}-group`;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <fieldset
      id={groupId}
      style={{
        marginBottom: tokens.space[4],
        border: `1px solid ${tokens.semantic.border.default}`,
        borderRadius: tokens.radius.md,
        padding: tokens.space[3],
        borderColor: error ? tokens.semantic.error.border : undefined,
      }}
      aria-describedby={errorId}
      aria-invalid={!!error}
    >
      <legend style={{ fontSize: tokens.font.size.sm, fontWeight: tokens.font.weight.medium, padding: '0 0.25rem' }}>
        {label}
      </legend>
      <div style={{ display: 'flex', gap: tokens.space[4], flexWrap: 'wrap', marginTop: tokens.space[2] }} role="radiogroup" aria-label={label}>
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: tokens.space[2],
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.7 : 1,
          }}
        >
          <input
            type="radio"
            name={id}
            value="CASH"
            checked={value === 'CASH'}
            onChange={() => onChange('CASH')}
            disabled={disabled}
            aria-checked={value === 'CASH'}
          />
          <span>{cashLabel}</span>
        </label>
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: tokens.space[2],
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.7 : 1,
          }}
        >
          <input
            type="radio"
            name={id}
            value="BANK_TRANSFER"
            checked={value === 'BANK_TRANSFER'}
            onChange={() => onChange('BANK_TRANSFER')}
            disabled={disabled}
            aria-checked={value === 'BANK_TRANSFER'}
          />
          <span>{bankLabel}</span>
        </label>
      </div>
      {error && (
        <p id={errorId} role="alert" style={{ fontSize: tokens.font.size.xs, color: tokens.semantic.error.text, marginTop: tokens.space[2] }}>
          {error}
        </p>
      )}
    </fieldset>
  );
}
