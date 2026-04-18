'use client';

import React from 'react';
import { formatUKDate } from '@/lib/format/date';
import type { LoanExceptionEvents } from '@/lib/api/hooks/member';
import { EmptyState } from '@/components/ui';

export interface LoanExceptionHistoryProps {
  exceptionEvents: LoanExceptionEvents | undefined;
  emptyTitle?: string;
  emptyDescription?: string;
}

type ExceptionItem =
  | { type: 'WAIVER'; id: string; reason: string; approvedByUserId: string; approvedAt: string; scheduleItemId?: string | null; amountMinorWaived?: number; waiverType?: string | null }
  | { type: 'RESCHEDULE'; id: string; reason: string; approvedByUserId: string; approvedAt: string; previousTermPeriods?: number | null; newTermPeriods?: number | null; firstDueDate?: string | null }
  | { type: 'WRITE_OFF'; id: string; reason: string; approvedByUserId: string; approvedAt: string; amountMinorWrittenOff?: number | null };

function mergeAndSort(events: LoanExceptionEvents): ExceptionItem[] {
  const items: ExceptionItem[] = [];
  events.waivers.forEach((w) => items.push({ type: 'WAIVER', ...w }));
  events.reschedules.forEach((r) => items.push({ type: 'RESCHEDULE', ...r }));
  events.writeOffs.forEach((w) => items.push({ type: 'WRITE_OFF', ...w }));
  items.sort((a, b) => new Date(b.approvedAt).getTime() - new Date(a.approvedAt).getTime());
  return items;
}

export function LoanExceptionHistory({
  exceptionEvents,
  emptyTitle = 'No exception events',
  emptyDescription = 'Waivers, reschedules and write-offs will appear here.',
}: LoanExceptionHistoryProps) {
  if (!exceptionEvents?.waivers?.length && !exceptionEvents?.reschedules?.length && !exceptionEvents?.writeOffs?.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  const items = mergeAndSort(exceptionEvents);

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {items.map((item) => {
        const badgeStyle =
          item.type === 'WAIVER'
            ? { backgroundColor: '#dbeafe', color: '#1e40af' }
            : item.type === 'RESCHEDULE'
              ? { backgroundColor: '#fef3c7', color: '#92400e' }
              : { backgroundColor: '#fce7f3', color: '#9d174d' };
        return (
          <li key={`${item.type}-${item.id}`} style={{ padding: '0.75rem 0', borderBottom: '1px solid #e5e7eb' }}>
            <span
              style={{
                display: 'inline-block',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                marginBottom: '0.35rem',
                ...badgeStyle,
              }}
            >
              {item.type === 'WAIVER' ? 'Waiver' : item.type === 'RESCHEDULE' ? 'Reschedule' : 'Write-off'}
            </span>
            <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>{item.reason}</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>
              Approved by {item.approvedByUserId} · {formatUKDate(item.approvedAt)}
            </p>
            {item.type === 'RESCHEDULE' && (
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#92400e' }}>
                Prior schedule superseded. New term: {item.newTermPeriods ?? '—'} periods.
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
