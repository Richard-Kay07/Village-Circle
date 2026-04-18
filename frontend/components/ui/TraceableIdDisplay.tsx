'use client';

import React, { useState, useCallback } from 'react';
import { tokens } from '@/lib/design-system/tokens';

const DEFAULT_TRUNCATE_HEAD = 8;
const DEFAULT_TRUNCATE_TAIL = 4;

export interface TraceableIdDisplayProps {
  value: string;
  truncateHead?: number;
  truncateTail?: number;
  expandThreshold?: number;
  copyLabel?: string;
  expandLabel?: string;
  collapseLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

function truncateId(value: string, head: number, tail: number): string {
  if (value.length <= head + tail + 3) return value;
  return value.slice(0, head) + '\u2026' + value.slice(-tail);
}

export function TraceableIdDisplay({
  value,
  truncateHead = DEFAULT_TRUNCATE_HEAD,
  truncateTail = DEFAULT_TRUNCATE_TAIL,
  expandThreshold = 24,
  copyLabel = 'Copy ID',
  expandLabel = 'Show full',
  collapseLabel = 'Show less',
  className,
  style,
}: TraceableIdDisplayProps) {
  const [expanded, setExpanded] = useState(value.length <= expandThreshold);
  const [copied, setCopied] = useState(false);

  const truncated = truncateId(value, truncateHead, truncateTail);
  const showExpand = value.length > truncateHead + truncateTail + 3;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [value]);

  return (
    <span
      className={'traceable-id-display break-word ' + (className ?? '')}
      style={{ fontFamily: 'ui-monospace, monospace', fontSize: tokens.font.size.sm, ...style }}
    >
      <span aria-label={value}>{expanded ? value : truncated}</span>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copyLabel}
        style={{
          marginLeft: tokens.space[2],
          padding: tokens.space[1] + ' ' + tokens.space[2],
          fontSize: tokens.font.size.xs,
          color: tokens.semantic.text.secondary,
          background: 'none',
          border: '1px solid ' + tokens.semantic.border.default,
          borderRadius: tokens.radius.sm,
          cursor: 'pointer',
        }}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
      {showExpand && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          style={{
            marginLeft: tokens.space[1],
            padding: tokens.space[1] + ' ' + tokens.space[2],
            fontSize: tokens.font.size.xs,
            color: tokens.semantic.text.secondary,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          {expanded ? collapseLabel : expandLabel}
        </button>
      )}
    </span>
  );
}
