'use client';

import React from 'react';
import { tokens } from '@/lib/design-system/tokens';

export interface AuditEventRowProps {
  /** e.g. "Contribution recorded" or "Loan approved" */
  eventType: string;
  /** e.g. "By Jane · 2 Jan 2025 14:30" */
  meta?: string;
  /** Optional entity link or ID */
  entityRef?: string;
  children?: React.ReactNode;
}

/**
 * Row for audit/timeline list. Dense but readable on mobile; no table required.
 */
export function AuditEventRow({ eventType, meta, entityRef, children }: AuditEventRowProps) {
  return (
    <div
      className="audit-event-row break-word"
      style={{
        padding: tokens.space[3],
        borderBottom: `1px solid ${tokens.semantic.border.default}`,
        minWidth: 0,
      }}
    >
      <div style={{ fontWeight: tokens.font.weight.medium, fontSize: tokens.font.size.sm }}>{eventType}</div>
      {(meta || entityRef) && (
        <div style={{ fontSize: tokens.font.size.xs, color: tokens.semantic.text.muted, marginTop: tokens.space[1] }}>
          {meta}
          {meta && entityRef ? ' · ' : ''}
          {entityRef}
        </div>
      )}
      {children && <div style={{ marginTop: tokens.space[2] }}>{children}</div>}
    </div>
  );
}
