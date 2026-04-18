'use client';

import React from 'react';
import { formatGBP } from '@/lib/format/currency';
import { formatUKDate } from '@/lib/format/date';
import type { LoanScheduleItem } from '@/lib/api/hooks/member';
import { EmptyState } from '@/components/ui';

export interface LoanScheduleTableProps {
  scheduleItems: LoanScheduleItem[];
  emptyTitle?: string;
  emptyDescription?: string;
}

export function LoanScheduleTable({
  scheduleItems,
  emptyTitle = 'No schedule',
  emptyDescription = 'Schedule will appear after disbursement.',
}: LoanScheduleTableProps) {
  if (!scheduleItems?.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
            <th style={{ padding: '0.5rem 0.5rem 0.5rem 0' }}>#</th>
            <th style={{ padding: '0.5rem' }}>Due date</th>
            <th style={{ padding: '0.5rem', textAlign: 'right' }}>Principal</th>
            <th style={{ padding: '0.5rem', textAlign: 'right' }}>Interest</th>
            <th style={{ padding: '0.5rem', textAlign: 'right' }}>Penalty</th>
            <th style={{ padding: '0.5rem', textAlign: 'right' }}>Total</th>
            <th style={{ padding: '0.5rem' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {scheduleItems.map((s) => {
            const isOverdue = s.status === 'OVERDUE';
            const principalDue = s.principalDueMinor ?? 0;
            const interestDue = s.interestDueMinor ?? 0;
            const penaltyDue = s.penaltyDueMinor ?? 0;
            const totalDue = s.totalDueMinor ?? principalDue + interestDue + penaltyDue;
            return (
              <tr
                key={s.installmentNo}
                style={{
                  borderBottom: '1px solid #e5e7eb',
                  backgroundColor: isOverdue ? '#fef2f2' : undefined,
                }}
              >
                <td style={{ padding: '0.5rem 0.5rem 0.5rem 0' }}>{s.installmentNo}</td>
                <td style={{ padding: '0.5rem' }}>{formatUKDate(s.dueDate)}</td>
                <td style={{ padding: '0.5rem', textAlign: 'right' }}>{formatGBP(principalDue)}</td>
                <td style={{ padding: '0.5rem', textAlign: 'right' }}>{formatGBP(interestDue)}</td>
                <td style={{ padding: '0.5rem', textAlign: 'right' }}>{formatGBP(penaltyDue)}</td>
                <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 500 }}>{formatGBP(totalDue)}</td>
                <td style={{ padding: '0.5rem', color: isOverdue ? '#b91c1c' : undefined }}>{s.status}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
