import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TreasurerLoanDetailPage from '@/app/treasurer/loans/loan/[loanId]/page';

jest.mock('@/lib/context/capabilities-context', () => ({
  useCapabilities: jest.fn(() => []),
}));

jest.mock('@/lib/api/hooks/treasurer', () => ({
  useTreasurerGroupId: () => 'g1',
}));

jest.mock('@/lib/api/hooks/member', () => ({
  useLoanDetail: jest.fn(),
}));

function renderLoanDetail(loanId: string, capabilities: string[] = []) {
  const { useCapabilities } = require('@/lib/context/capabilities-context');
  useCapabilities.mockReturnValue(capabilities);

  const { useLoanDetail } = require('@/lib/api/hooks/member');
  useLoanDetail.mockReturnValue({
    data: {
      id: loanId,
      groupId: 'g1',
      borrowerId: 'm1',
      principalAmountMinor: 10000,
      totalRepaidMinor: 0,
      state: 'ACTIVE',
      interestEnabledSnapshot: false,
      interestRateBpsSnapshot: 0,
      termPeriods: 12,
      scheduleItems: [{ installmentNo: 1, dueDate: '2025-02-01', principalDueMinor: 833, interestDueMinor: 0, totalDueMinor: 833, status: 'DUE' }],
      repayments: [],
    },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  });

  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <TreasurerLoanDetailPage params={{ loanId }} />
    </QueryClientProvider>
  );
}

describe('Treasurer Loan Detail repayment action', () => {
  it('hides Record repayment link when user lacks loan.repayment.record', async () => {
    renderLoanDetail('loan-1', []);
    await waitFor(() => {
      expect(screen.getByText(/Repayment history/i)).toBeInTheDocument();
    });
    expect(screen.queryByRole('link', { name: /record repayment/i })).not.toBeInTheDocument();
  });

  it('shows Record repayment link when user has loan.repayment.record', async () => {
    renderLoanDetail('loan-1', ['loan.repayment.record']);
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /record repayment/i })).toBeInTheDocument();
    });
  });
});
