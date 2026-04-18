import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoanExceptionHistory } from '@/components/loan/LoanExceptionHistory';
import type { LoanExceptionEvents } from '@/lib/api/hooks/member';

describe('LoanExceptionHistory', () => {
  it('indicates prior schedule superseded for reschedule events', () => {
    const events: LoanExceptionEvents = {
      waivers: [],
      reschedules: [
        {
          id: 'r1',
          reason: 'Member requested extension',
          approvedByUserId: 'user-1',
          approvedAt: '2025-01-15T10:00:00Z',
          previousTermPeriods: 12,
          newTermPeriods: 18,
          firstDueDate: '2025-02-01',
        },
      ],
      writeOffs: [],
    };
    render(<LoanExceptionHistory exceptionEvents={events} />);
    expect(screen.getByText('Reschedule')).toBeInTheDocument();
    expect(screen.getByText('Member requested extension')).toBeInTheDocument();
    expect(screen.getByText(/Prior schedule superseded/)).toBeInTheDocument();
    expect(screen.getByText(/New term: 18 periods/)).toBeInTheDocument();
  });

  it('renders exception history ordering and metadata correctly', () => {
    const events: LoanExceptionEvents = {
      waivers: [
        { id: 'w1', reason: 'Penalty waived', approvedByUserId: 'user-2', approvedAt: '2025-01-10T12:00:00Z', scheduleItemId: null, amountMinorWaived: 500, waiverType: 'PENALTY' },
      ],
      reschedules: [
        { id: 'r1', reason: 'Reschedule', approvedByUserId: 'user-1', approvedAt: '2025-01-15T10:00:00Z', previousTermPeriods: 12, newTermPeriods: 18, firstDueDate: '2025-02-01' },
      ],
      writeOffs: [],
    };
    render(<LoanExceptionHistory exceptionEvents={events} />);
    expect(screen.getByText('Reschedule')).toBeInTheDocument();
    expect(screen.getByText('Waiver')).toBeInTheDocument();
    expect(screen.getByText('Penalty waived')).toBeInTheDocument();
    expect(screen.getByText('Reschedule')).toBeInTheDocument();
    expect(screen.getByText(/Approved by user-1/)).toBeInTheDocument();
    expect(screen.getByText(/Approved by user-2/)).toBeInTheDocument();
  });

  it('shows empty state when no events', () => {
    render(<LoanExceptionHistory exceptionEvents={{ waivers: [], reschedules: [], writeOffs: [] }} />);
    expect(screen.getByText('No exception events')).toBeInTheDocument();
  });
});
