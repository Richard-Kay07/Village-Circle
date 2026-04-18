'use client';

import React from 'react';
import { tokens } from '@/lib/design-system/tokens';

export interface ModeCount {
  mode: 'CASH' | 'BANK_TRANSFER';
  label: string;
  count: number;
  amountFormatted?: string;
}

export interface TransactionModeCountStripProps {
  counts: ModeCount[];
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Strip showing transaction mode counts (e.g. "Cash: 3 · Bank transfer: 2"). Compact for mobile.
 */
export function TransactionModeCountStrip({ counts, className, style }: TransactionModeCountStripProps) {
  return (
    <div
      className={`transaction-mode-count-strip ${className ?? ''}`.trim()}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: tokens.space[2],
        alignItems: 'center',
        fontSize: tokens.font.size.sm,
        color: tokens.semantic.text.secondary,
        ...style,
      }}
    >
      {counts.map((c, i) => (
        <span key={c.mode}>
          {i > 0 && ' · '}
          {c.label}: {c.count}
          {c.amountFormatted != null ? ` (${c.amountFormatted})` : ''}
        </span>
      ))}
    </div>
  );
}
