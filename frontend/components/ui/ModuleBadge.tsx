'use client';

import React from 'react';
import { tokens } from '@/lib/design-system/tokens';
import { getBrandModuleConfig, LATER_MODULE_IDS } from '@/lib/brand/architecture';
import type { ProductModuleId } from '@/lib/brand/architecture';

const MODULE_TOKEN_KEYS: Record<ProductModuleId, keyof typeof tokens.module> = {
  save: 'vcSave',
  hub: 'vcHub',
  grow: 'vcGrow',
  pay: 'vcPay',
  learn: 'vcLearn',
};

export interface ModuleBadgeProps {
  moduleId: ProductModuleId;
  short?: boolean;
  variant?: 'default' | 'comingSoon';
  className?: string;
  style?: React.CSSProperties;
}

export function ModuleBadge(props: ModuleBadgeProps) {
  const { moduleId, short = false, variant, className, style } = props;
  const config = getBrandModuleConfig(moduleId);
  const isLater = LATER_MODULE_IDS.includes(moduleId);
  const showComingSoon = variant === 'comingSoon' || (variant !== 'default' && isLater);

  let label: string;
  if (showComingSoon) {
    label = short ? 'Soon' : config.displayName + ' – Coming soon';
  } else {
    label = short ? config.shortLabel : config.displayName;
  }

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: tokens.space[1] + ' ' + tokens.space[2],
    borderRadius: tokens.radius.sm,
    fontSize: tokens.font.size.xs,
    fontWeight: tokens.font.weight.medium,
    ...style,
  };

  if (showComingSoon) {
    return (
      <span
        className={className}
        style={{
          ...baseStyle,
          backgroundColor: tokens.semantic.surface.muted,
          color: tokens.semantic.text.muted,
          border: '1px solid ' + tokens.semantic.border.subtle,
        }}
        aria-label={label}
      >
        {label}
      </span>
    );
  }

  const tokenKey = MODULE_TOKEN_KEYS[moduleId];
  const m = tokens.module[tokenKey];
  return (
    <span
      className={className}
      style={{
        ...baseStyle,
        backgroundColor: m.accentSoftBg,
        color: m.accent,
        border: '1px solid ' + m.accentBorder,
      }}
      aria-label={label}
    >
      {label}
    </span>
  );
}
