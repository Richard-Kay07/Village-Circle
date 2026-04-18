'use client';

import React from 'react';
import { getCopy, type CopyKey } from '@/lib/copy';

export interface CopyTextProps {
  /** Copy key from lib/copy/keys */
  copyKey: CopyKey;
  /** Optional override (use sparingly; prefer adding a key) */
  fallback?: string;
  as?: 'span' | 'p';
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Renders centralised UX copy by key. Use for labels, buttons, messages.
 * Keeps copy consistent and audit-friendly.
 */
export function CopyText({ copyKey, fallback, as: Tag = 'span', className, style }: CopyTextProps) {
  const text = fallback ?? getCopy(copyKey);
  return <Tag className={className} style={style}>{text}</Tag>;
}
