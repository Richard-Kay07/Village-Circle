'use client';

import React from 'react';
import { tokens } from '@/lib/design-system/tokens';

export type InlineStatusVariant = 'success' | 'warning' | 'error' | 'info';

export interface InlineStatusMessageProps {
  variant: InlineStatusVariant;
  children: React.ReactNode;
  /** Optional heading above message */
  title?: string;
  /** When true, render as a full-width banner (e.g. at top of section) */
  banner?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Associates message with controls for screen readers */
  id?: string;
}

const variantStyles: Record<InlineStatusVariant, { bg: string; text: string; border: string }> = {
  success: {
    bg: tokens.semantic.success.bg,
    text: tokens.semantic.success.text,
    border: tokens.semantic.success.border,
  },
  warning: {
    bg: tokens.semantic.warning.bg,
    text: tokens.semantic.warning.text,
    border: tokens.semantic.warning.border,
  },
  error: {
    bg: tokens.semantic.error.bg,
    text: tokens.semantic.error.text,
    border: tokens.semantic.error.border,
  },
  info: {
    bg: tokens.semantic.info.bg,
    text: tokens.semantic.info.text,
    border: tokens.semantic.info.border,
  },
};

/**
 * Inline status message or banner (success / warning / error / info).
 * Use for form feedback, alerts, and immutable/warning copy. Pair with icons/labels where appropriate.
 */
export function InlineStatusMessage({
  variant,
  children,
  title,
  banner = false,
  className,
  style,
  id,
}: InlineStatusMessageProps) {
  const s = variantStyles[variant];

  return (
    <div
      id={id}
      role={variant === 'error' ? 'alert' : 'status'}
      className={className}
      style={{
        padding: banner ? tokens.space[4] : tokens.space[3],
        backgroundColor: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
        borderRadius: tokens.radius.md,
        fontSize: tokens.font.size.sm,
        lineHeight: 1.5,
        ...(banner ? { marginBottom: tokens.space[4] } : {}),
        ...style,
      }}
    >
      {title && (
        <strong style={{ display: 'block', marginBottom: tokens.space[1] }}>{title}</strong>
      )}
      {children}
    </div>
  );
}
