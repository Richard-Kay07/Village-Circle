'use client';

import React from 'react';
import { CurrencyInput } from '@/components/forms/CurrencyInput';
import { tokens } from '@/lib/design-system/tokens';

export interface CurrencyAmountFieldProps {
  valueMinor?: number;
  onChangeMinor?: (minor: number) => void;
  onBlur?: () => void;
  label: string;
  /** Error message; when set, input is aria-invalid and error is announced */
  error?: string;
  /** Helper text below input (e.g. "Enter amount in pounds") */
  helperText?: string;
  placeholder?: string;
  disabled?: boolean;
  minMinor?: number;
  maxMinor?: number;
  id?: string;
}

/**
 * GBP amount field with clear error and helper text slots.
 * Uses minor units (pence) for API; integrates with displayToMinor/minorToDisplay.
 */
export function CurrencyAmountField({
  valueMinor = 0,
  onChangeMinor,
  onBlur,
  label,
  error,
  helperText,
  placeholder = '0.00',
  disabled,
  minMinor,
  maxMinor,
  id = 'currency-amount',
}: CurrencyAmountFieldProps) {
  const helperId = helperText ? `${id}-helper` : undefined;

  return (
    <div style={{ marginBottom: tokens.space[4] }} role="group" aria-labelledby={`${id}-label`}>
      <label id={`${id}-label`} htmlFor={id} style={{ display: 'block', fontSize: tokens.font.size.sm, fontWeight: tokens.font.weight.medium, marginBottom: tokens.space[1] }}>
        {label}
      </label>
      <CurrencyInput
        id={id}
        valueMinor={valueMinor}
        onChangeMinor={onChangeMinor}
        onBlur={onBlur}
        placeholder={placeholder}
        label={undefined}
        error={error}
        disabled={disabled}
        minMinor={minMinor}
        maxMinor={maxMinor}
      />
      {helperText && !error && (
        <p id={helperId} style={{ fontSize: tokens.font.size.xs, color: tokens.semantic.text.muted, marginTop: tokens.space[1] }}>
          {helperText}
        </p>
      )}
    </div>
  );
}
