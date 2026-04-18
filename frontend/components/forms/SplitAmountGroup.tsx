'use client';

import React from 'react';
import { CurrencyInput } from '@/components/forms/CurrencyInput';
import { tokens } from '@/lib/design-system/tokens';
import { formatGBP } from '@/lib/format';

export interface SplitAmountGroupProps {
  savingsMinor: number;
  socialFundMinor: number;
  onSavingsChange: (minor: number) => void;
  onSocialFundChange: (minor: number) => void;
  savingsLabel?: string;
  socialFundLabel?: string;
  totalLabel?: string;
  savingsError?: string;
  socialFundError?: string;
  disabled?: boolean;
  idPrefix?: string;
}

/**
 * Savings + social fund amount inputs with computed total display.
 * Uses minor units (pence); total is read-only.
 */
export function SplitAmountGroup({
  savingsMinor,
  socialFundMinor,
  onSavingsChange,
  onSocialFundChange,
  savingsLabel = 'Savings',
  socialFundLabel = 'Social fund',
  totalLabel = 'Total',
  savingsError,
  socialFundError,
  disabled,
  idPrefix = 'split-amount',
}: SplitAmountGroupProps) {
  const totalMinor = savingsMinor + socialFundMinor;

  return (
    <div style={{ marginBottom: tokens.space[4] }} role="group" aria-label="Savings and social fund amounts">
      <div style={{ display: 'grid', gap: tokens.space[4], gridTemplateColumns: '1fr 1fr' }}>
        <div>
          <CurrencyInput
            id={`${idPrefix}-savings`}
            label={savingsLabel}
            valueMinor={savingsMinor}
            onChangeMinor={onSavingsChange}
            error={savingsError}
            disabled={disabled}
            placeholder="0.00"
          />
        </div>
        <div>
          <CurrencyInput
            id={`${idPrefix}-social`}
            label={socialFundLabel}
            valueMinor={socialFundMinor}
            onChangeMinor={onSocialFundChange}
            error={socialFundError}
            disabled={disabled}
            placeholder="0.00"
          />
        </div>
      </div>
      <div
        style={{
          marginTop: tokens.space[3],
          padding: tokens.space[3],
          backgroundColor: tokens.semantic.surface.muted,
          borderRadius: tokens.radius.md,
          border: `1px solid ${tokens.semantic.border.subtle}`,
        }}
      >
        <span style={{ fontSize: tokens.font.size.sm, color: tokens.semantic.text.secondary }}>{totalLabel}: </span>
        <span style={{ fontSize: tokens.font.size.base, fontWeight: tokens.font.weight.semibold }}>{formatGBP(totalMinor)}</span>
      </div>
    </div>
  );
}
