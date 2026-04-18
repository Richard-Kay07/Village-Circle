import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MemberStatementsPage from '@/app/member/statements/page';

jest.mock('@/lib/member/context', () => ({
  useMemberSession: jest.fn(() => ({ groupId: 'g1', memberId: 'm1' })),
}));

const mockRefetch = jest.fn();
jest.mock('@/lib/api/hooks/member', () => ({
  useContributionHistory: jest.fn(() => ({
    data: null,
    isLoading: false,
    isError: false,
    refetch: mockRefetch,
  })),
}));

function renderStatements() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemberStatementsPage />
    </QueryClientProvider>
  );
}

describe('Member Statements', () => {
  it('shows loading skeleton when history is loading', () => {
    const { useContributionHistory } = require('@/lib/api/hooks/member');
    useContributionHistory.mockReturnValue({ data: null, isLoading: true, isError: false, refetch: mockRefetch });
    renderStatements();
    expect(screen.getByText('My Statements')).toBeInTheDocument();
    expect(document.querySelector('.loading-skeleton')).toBeInTheDocument();
  });

  it('shows error state with retry when history fails', () => {
    const { useContributionHistory } = require('@/lib/api/hooks/member');
    useContributionHistory.mockReturnValue({ data: null, isLoading: false, isError: true, refetch: mockRefetch });
    renderStatements();
    expect(screen.getByText(/Could not load statements/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('loads and shows entries with separate savings and social fund amounts', async () => {
    const { useContributionHistory } = require('@/lib/api/hooks/member');
    useContributionHistory.mockReturnValue({
      data: {
        contributions: [
          {
            id: 'c1',
            recordedAt: '2025-01-15T12:00:00Z',
            totalAmountMinor: 1500,
            savingsAmountMinor: 1000,
            socialFundAmountMinor: 500,
          },
        ],
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });
    renderStatements();
    await waitFor(() => {
      expect(screen.getByText('Entries by bucket')).toBeInTheDocument();
    });
    expect(screen.getByText(/Savings/)).toBeInTheDocument();
    expect(screen.getByText(/Social fund/)).toBeInTheDocument();
    expect(screen.getByText(/£15\.00/)).toBeInTheDocument();
  });

  it('shows empty state when no contributions', async () => {
    const { useContributionHistory } = require('@/lib/api/hooks/member');
    useContributionHistory.mockReturnValue({
      data: { contributions: [] },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });
    renderStatements();
    await waitFor(() => {
      expect(screen.getByText('No entries')).toBeInTheDocument();
    });
  });
});
