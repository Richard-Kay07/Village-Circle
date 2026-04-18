import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MemberDashboardPage from '@/app/member/page';

jest.mock('@/lib/member/context', () => ({
  useMemberSession: jest.fn(() => ({ groupId: 'g1', memberId: 'm1' })),
}));

const mockRefetch = jest.fn();
jest.mock('@/lib/api/hooks/member', () => ({
  useLedgerBalance: jest.fn((_: string | null, bucket: string) => ({
    data: bucket === 'SAVINGS' ? { balance: 10000 } : { balance: 2500 },
    isLoading: false,
    isError: false,
    refetch: mockRefetch,
  })),
  useLoansByGroup: jest.fn(() => ({
    data: [],
    isLoading: false,
    isError: false,
    refetch: mockRefetch,
  })),
}));

function renderDashboard() {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>
      <MemberDashboardPage />
    </QueryClientProvider>
  );
}

describe('Member Dashboard', () => {
  it('renders separate social fund and savings totals', () => {
    renderDashboard();
    expect(screen.getByText('Savings total')).toBeInTheDocument();
    expect(screen.getByText('Social fund total')).toBeInTheDocument();
  });

  it('shows loading skeleton when data is loading', () => {
    const { useLedgerBalance, useLoansByGroup } = require('@/lib/api/hooks/member');
    useLedgerBalance.mockReturnValue({ data: null, isLoading: true, isError: false, refetch: mockRefetch });
    useLoansByGroup.mockReturnValue({ data: null, isLoading: true, isError: false, refetch: mockRefetch });
    renderDashboard();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(document.body.querySelector('.loading-skeleton')).not.toBeNull();
  });

  it('shows error state with retry when balance or loans fail', () => {
    const { useLedgerBalance, useLoansByGroup } = require('@/lib/api/hooks/member');
    useLedgerBalance.mockReturnValue({ data: null, isLoading: false, isError: true, refetch: mockRefetch });
    useLoansByGroup.mockReturnValue({ data: null, isLoading: false, isError: false, refetch: mockRefetch });
    renderDashboard();
    expect(screen.getByText(/Could not load your summary/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again|retry/i })).toBeInTheDocument();
  });
});
