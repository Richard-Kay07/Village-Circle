'use client';

import React from 'react';

export interface EvidenceBadgeProps {
  textRef?: string | null;
  hasImage?: boolean;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function EvidenceBadge({ textRef, hasImage, label, className, style }: EvidenceBadgeProps) {
  const hasText = !!textRef?.trim();
  const parts: string[] = [];
  if (hasText) parts.push('Text');
  if (hasImage) parts.push('Image');
  const summary = parts.length === 0 ? 'No evidence' : parts.join(' + ');

  return (
    <span
      className={className}
      style={{
        display: 'inline-block',
        fontSize: '0.75rem',
        padding: '0.2rem 0.5rem',
        borderRadius: '4px',
        backgroundColor: hasText || hasImage ? '#e0f2fe' : '#f3f4f6',
        color: hasText || hasImage ? '#0369a1' : '#6b7280',
        ...style,
      }}
      title={hasText ? `Ref: ${textRef}` : undefined}
    >
      {label ?? summary}
    </span>
  );
}
