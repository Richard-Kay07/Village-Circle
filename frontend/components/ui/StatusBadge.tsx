'use client';

import React from 'react';
import { tokens } from '@/lib/design-system/tokens';
import { getStatusBadgeLabel } from '@/lib/design-system/badges/config';
import type { StatusId } from '@/lib/design-system/tokens';

export interface StatusBadgeProps {
  statusId: StatusId;
  short?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function StatusBadge({ statusId, short = false, className, style }: StatusBadgeProps) {
  const s = tokens.status[statusId];
  const label = getStatusBadgeLabel(statusId, short);

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
        backgroundColor: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
        ...style,
      }}
      aria-label={label}
    >
      {label}
    </span>
  );
}
