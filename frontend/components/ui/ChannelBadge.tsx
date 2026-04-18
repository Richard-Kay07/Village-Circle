'use client';

import React from 'react';
import { tokens } from '@/lib/design-system/tokens';
import { getChannelBadgeLabel } from '@/lib/design-system/badges/config';
import type { ChannelId } from '@/lib/design-system/badges/config';

export interface ChannelBadgeProps {
  channelId: ChannelId;
  /** Use short label on narrow screens */
  short?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/** Neutral styling so channel is distinct from status (success/error) */
export function ChannelBadge({ channelId, short = false, className, style }: ChannelBadgeProps) {
  const label = getChannelBadgeLabel(channelId, short);

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
