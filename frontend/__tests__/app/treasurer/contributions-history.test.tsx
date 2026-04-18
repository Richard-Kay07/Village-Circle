import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TreasurerContributionsPage from '@/app/treasurer/contributions/page';

const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: () => '/treasurer/contributions',
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('@/lib/api/hooks/treasurer', () => ({
  useTreasurerGroupId: () => 'g1',
  useMeetingsByGroup: () => ({
    data: [{ id: 'm1', groupId: 'g1', heldAt: '2025-01-15T12:00:00Z', name: 'January meeting' }],
    isLoading: false,
    isError: false,
  }),
  useMembersByGroup: () => ({
    data: [{ id: 'mem1', displayName: 'Alice' }],
    isLoading: false,
    isError: false,
  }),
  useContributionListByGroup: jest.fn(),
}));

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <TreasurerContributionsPage />
    </QueryClientProvider>
  );
}

describe('Treasurer Contributions History', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    const { useContributionListByGroup } = require('@/lib/api/hooks/treasurer');
    useContributionListByGroup.mockImplementation((groupId: string, filters: Record<string, unknown>) => ({
      data: {
        contributions: [],
        totalSavingsMinor: 12000,
        totalSocialFundMinor: 3000,
        totalAmountMinor: 15000,
        byMode: {
          CASH: { count: 2, savingsMinor: 5000, socialFundMinor: 1000 },
          BANK_TRANSFER: { count: 1, savingsMinor: 7000, socialFundMinor: 2000 },
        },
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    }));
  });

  it('shows separate savings and social fund totals', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/Savings total:/)).toBeInTheDocument();
      expect(screen.getByText(/Social fund total:/)).toBeInTheDocument();
    });
    expect(screen.getByText('£120.00')).toBeInTheDocument();
    expect(screen.getByText('£30.00')).toBeInTheDocument();
  });

  it('updates URL when meeting filter is changed', async () => {
    renderPage();
    const meetingSelect = screen.getByRole('combobox', { name: /Meeting/i });
    fireEvent.change(meetingSelect, { target: { value: 'm1' } });
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining('meetingId=m1'));
    });
  });

  it('updates URL when status filter is changed', async () => {
    renderPage();
    const statusSelect = screen.getByRole('combobox', { name: /Status/i });
    fireEvent.change(statusSelect, { target: { value: 'REVERSED' } });
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining('status=REVERSED'));
    });
  });
});
