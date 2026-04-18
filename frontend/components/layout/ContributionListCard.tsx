'use client';

import React from 'react';
import Link from 'next/link';
import { tokens } from '@/lib/design-system/tokens';
import { StatusBadge, TransactionModeBadge } from '@/components/ui';

export interface ContributionListCardProps {
  href: string;
  /** e.g. member name or "Meeting: 1 Jan 2025" */
  title: string;
  /** e.g. "£50 savings · £10 social" */
  amountSummary?: string;
  dateText?: string;
  statusId?: 'recorded' | 'reversed';
  transactionMode?: 'CASH' | 'BANK_TRANSFER';
  /** Optional evidence indicator (e.g. "Evidence" badge) */
  evidenceLabel?: React.ReactNode;
}

/**
 * Card/row for contribution list (mobile-friendly). Use in list views; avoid horizontal scroll.
 */
export function ContributionListCard({
  href,
  title,
  amountSummary,
  dateText,
  statusId,
  transactionMode,
  evidenceLabel,
}: ContributionListCardProps) {
  return (
    <Link
      href={href}
      className="contribution-list-card break-word"
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
        {transactionMode && <TransactionModeBadge mode={transactionMode} short />}
        {evidenceLabel}
      </div>
      {(amountSummary || dateText) && (
        <div style={{ fontSize: tokens.font.size.sm, color: tokens.semantic.text.secondary }}>
          {amountSummary}
          {amountSummary && dateText ? ' · ' : ''}
          {dateText}
        </div>
      )}
    </Link>
  );
}
