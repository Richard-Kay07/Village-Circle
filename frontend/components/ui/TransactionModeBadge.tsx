'use client';

import React from 'react';
import { tokens } from '@/lib/design-system/tokens';
import { getTransactionModeBadgeLabel } from '@/lib/design-system/badges/config';
import type { TransactionModeId } from '@/lib/design-system/badges/config';

export interface TransactionModeBadgeProps {
  mode: TransactionModeId;
  /** Use short label on narrow screens */
  short?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/** Neutral styling so transaction mode is not confused with status colours */
export function TransactionModeBadge({ mode, short = false, className, style }: TransactionModeBadgeProps) {
  const label = getTransactionModeBadgeLabel(mode, short);

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: `${tokens.space[1]} ${tokens.space[2]}`,
        borderRadius: tokens.radius.sm,
        fontSize: tokens.font.size.xs,
        fontWeight: tokens.font.weight.medium,
        backgroundColor: tokens.semantic.surface.muted,
        color: tokens.semantic.text.secondary,
        border: `1px solid ${tokens.semantic.border.default}`,
        ...style,
      }}
      aria-label={label}
    >
      {label}
    </span>
  );
}
