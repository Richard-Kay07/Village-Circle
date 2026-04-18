'use client';

import React from 'react';
import Link from 'next/link';
import { tokens } from '@/lib/design-system/tokens';
import { StatusBadge } from '@/components/ui';

export interface LoanListCardProps {
  href: string;
  /** e.g. member name or loan ref */
  title: string;
  /** e.g. "£500 principal" or "Balance: £400" */
  amountSummary?: string;
  dateText?: string;
  statusId?: 'pending' | 'approved' | 'overdue' | 'recorded';
  /** Optional secondary line */
  subtitle?: string;
}

/**
 * Card/row for loan list (queue, my loans). Mobile-friendly; no horizontal scroll.
 */
export function LoanListCard({
  href,
  title,
  amountSummary,
  dateText,
  statusId,
  subtitle,
}: LoanListCardProps) {
  return (
    <Link
      href={href}
      className="loan-list-card break-word"
      style={{
        display: 'block',
        padding: tokens.space[3],
        backgroundColor: tokens.semantic.surface.default,
        border: `1px solid ${tokens.semantic.border.default}`,
        borderRadius: tokens.radius.md,
        marginBottom: tokens.space[2],
        textDecoration: 'none',
        color: 'inherit',
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: tokens.space[2], marginBottom: tokens.space[1] }}>
        <span style={{ fontWeight: tokens.font.weight.semibold, fontSize: tokens.font.size.base }}>{title}</span>
        {statusId && <StatusBadge statusId={statusId} short />}
      </div>
      {(amountSummary || dateText) && (
        <div style={{ fontSize: tokens.font.size.sm, color: tokens.semantic.text.secondary }}>
          {amountSummary}
          {amountSummary && dateText ? ' · ' : ''}
          {dateText}
        </div>
      )}
      {subtitle && (
        <div style={{ fontSize: tokens.font.size.xs, color: tokens.semantic.text.muted, marginTop: tokens.space[1] }}>{subtitle}</div>
      )}
    </Link>
  );
}
