'use client';

import React from 'react';
import { tokens } from '@/lib/design-system/tokens';

export interface StatusCount {
  statusId: string;
  label: string;
  count: number;
}

export interface StatusSummaryStripProps {
  items: StatusCount[];
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Strip showing status counts (e.g. "Recorded: 10 · Reversed: 1"). For list summaries.
 */
export function StatusSummaryStrip({ items, className, style }: StatusSummaryStripProps) {
  return (
    <div
      className={`status-summary-strip ${className ?? ''}`.trim()}
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
      {items.map((item, i) => (
        <span key={item.statusId}>
          {i > 0 && ' · '}
          {item.label}: {item.count}
        </span>
      ))}
    </div>
  );
}
