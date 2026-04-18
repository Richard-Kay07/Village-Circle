import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TreasurerMeetingDetailPage from '@/app/treasurer/contributions/meeting/[meetingId]/page';

jest.mock('@/lib/context/capabilities-context', () => ({
  useCapabilities: jest.fn(() => []),
}));

jest.mock('@/lib/api/hooks/treasurer', () => ({
  useTreasurerGroupId: () => 'g1',
  useMeetingSummary: () => ({
    data: {
      meetingId: 'mtg1',
      totalSavingsMinor: 1000,
      totalSocialFundMinor: 500,
      totalAmountMinor: 1500,
      byMode: { CASH: { count: 1 }, BANK_TRANSFER: { count: 0 } },
      contributions: [{ id: 'c1', memberProfileId: 'm1', savingsAmountMinor: 1000, socialFundAmountMinor: 500, transactionMode: 'CASH' }],
    },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  }),
  useReversalContribution: () => ({ mutateAsync: jest.fn().mockResolvedValue({}), isPending: false, isError: false, error: null }),
}));

jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

function renderDetail(meetingId: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <TreasurerMeetingDetailPage params={{ meetingId }} />
    </QueryClientProvider>
  );
}

describe('Treasurer Meeting Reversal', () => {
  it('reversal button is hidden when user lacks contribution.reverse', () => {
    renderDetail('mtg1');
    expect(screen.queryByRole('button', { name: /reverse/i })).not.toBeInTheDocument();
  });

  it('reversal button is shown when user has contribution.reverse', async () => {
    const useCapabilities = require('@/lib/context/capabilities-context').useCapabilities;
    useCapabilities.mockReturnValue(['contribution.reverse']);

    renderDetail('mtg1');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /reverse/i })).toBeInTheDocument();
    });
  });

  it('reversal reason is required before submit', async () => {
    const useCapabilities = require('@/lib/context/capabilities-context').useCapabilities;
    useCapabilities.mockReturnValue(['contribution.reverse']);

    renderDetail('mtg1');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /reverse/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /reverse/i }));
    await waitFor(() => {
      expect(screen.getByLabelText(/reason \(required\)/i)).toBeInTheDocument();
    });
    const reverseBtn = screen.getByRole('button', { name: /^reverse$/i });
    expect(reverseBtn).toBeDisabled();
    fireEvent.change(screen.getByPlaceholderText(/e.g. Duplicate entry/i), { target: { value: 'Duplicate' } });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^reverse$/i })).not.toBeDisabled();
    });
  });
});
