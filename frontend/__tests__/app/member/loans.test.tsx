import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MemberLoansPage from '@/app/member/loans/page';

jest.mock('@/lib/member/context', () => ({
  useMemberSession: jest.fn(() => ({ groupId: 'g1', memberId: 'm1' })),
}));

const mockLoans = [
  { id: 'loan-1', borrowerId: 'm1', principalAmountMinor: 10000, state: 'ACTIVE', totalRepaidMinor: 0 },
  { id: 'loan-2', borrowerId: 'm1', principalAmountMinor: 5000, state: 'ACTIVE', totalRepaidMinor: 0 },
];

jest.mock('@/lib/api/hooks/member', () => ({
  useLoansByGroup: jest.fn(() => ({
    data: mockLoans,
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  })),
}));

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query');
  return {
    ...actual,
    useQueries: jest.fn(() => [
      { data: { interestEnabledSnapshot: true, scheduleItems: [{ status: 'DUE', dueDate: '2025-04-01', totalDueMinor: 500 }] } },
      { data: { interestEnabledSnapshot: false, scheduleItems: [{ status: 'DUE', dueDate: '2025-05-01', totalDueMinor: 250 }] } },
    ]),
  };
});

function renderLoans() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemberLoansPage />
    </QueryClientProvider>
  );
}

describe('Member Loans list', () => {
  it('renders interest enabled and disabled labels', () => {
    renderLoans();
    expect(screen.getByText(/Interest: Enabled/)).toBeInTheDocument();
    expect(screen.getByText(/Interest: Disabled/)).toBeInTheDocument();
  });
});
