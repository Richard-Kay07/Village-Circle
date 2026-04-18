'use client';

import React from 'react';
import { tokens } from '@/lib/design-system/tokens';

export interface BucketTotal {
  label: string;
  valueFormatted: string;
  valueMinor?: number;
}

export interface TotalsByBucketCardProps {
  buckets: BucketTotal[];
  /** Optional total line (e.g. "Total: £500") */
  totalLabel?: string;
  totalFormatted?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Summary card: totals by bucket (e.g. Savings total, Social fund total). Mobile-friendly strip.
 */
export function TotalsByBucketCard({
  buckets,
  totalLabel,
  totalFormatted,
  className,
  style,
}: TotalsByBucketCardProps) {
  return (
    <div
      className={`totals-by-bucket-card ${className ?? ''}`.trim()}
      style={{
        padding: tokens.space[4],
        backgroundColor: tokens.semantic.surface.muted,
        border: `1px solid ${tokens.semantic.border.subtle}`,
        borderRadius: tokens.radius.md,
        ...style,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.space[2] }}>
        {buckets.map((b, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: tokens.space[1] }}>
            <span style={{ fontSize: tokens.font.size.sm, color: tokens.semantic.text.secondary }}>{b.label}</span>
            <span style={{ fontSize: tokens.font.size.base, fontWeight: tokens.font.weight.semibold }}>{b.valueFormatted}</span>
          </div>
        ))}
        {totalLabel != null && totalFormatted != null && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: tokens.space[2], paddingTop: tokens.space[2], borderTop: `1px solid ${tokens.semantic.border.default}` }}>
            <span style={{ fontSize: tokens.font.size.sm, fontWeight: tokens.font.weight.medium }}>{totalLabel}</span>
            <span style={{ fontSize: tokens.font.size.lg, fontWeight: tokens.font.weight.bold }}>{totalFormatted}</span>
          </div>
        )}
      </div>
    </div>
  );
}
