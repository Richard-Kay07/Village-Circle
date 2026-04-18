import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoanScheduleTable } from '@/components/loan/LoanScheduleTable';
import type { LoanScheduleItem } from '@/lib/api/hooks/member';

describe('LoanScheduleTable', () => {
  it('renders zero-interest loan schedule correctly', () => {
    const items: LoanScheduleItem[] = [
      { installmentNo: 1, dueDate: '2025-02-01', principalDueMinor: 10000, interestDueMinor: 0, totalDueMinor: 10000, status: 'DUE' },
      { installmentNo: 2, dueDate: '2025-03-01', principalDueMinor: 10000, interestDueMinor: 0, totalDueMinor: 10000, status: 'DUE' },
    ];
    render(<LoanScheduleTable scheduleItems={items} />);
    expect(screen.getByText('£100.00')).toBeInTheDocument();
    expect(screen.getByText('DUE')).toBeInTheDocument();
  });

  it('highlights overdue rows', () => {
    const items: LoanScheduleItem[] = [
      { installmentNo: 1, dueDate: '2025-01-01', principalDueMinor: 5000, interestDueMinor: 0, totalDueMinor: 5000, status: 'OVERDUE' },
    ];
    const { container } = render(<LoanScheduleTable scheduleItems={items} />);
    const row = container.querySelector('tbody tr');
    expect(row).toHaveStyle({ backgroundColor: '#fef2f2' });
    expect(screen.getByText('OVERDUE')).toBeInTheDocument();
  });

  it('shows empty state when no items', () => {
    render(<LoanScheduleTable scheduleItems={[]} />);
    expect(screen.getByText('No schedule')).toBeInTheDocument();
  });
});
