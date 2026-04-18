import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TreasurerMeetingEntryPage from '@/app/treasurer/contributions/meeting/[meetingId]/entry/page';

const mockMutateAsync = jest.fn().mockResolvedValue({ recorded: 2, ids: ['c1', 'c2'] });

jest.mock('@/lib/api/hooks/treasurer', () => ({
  useTreasurerGroupId: () => 'g1',
  useMembersByGroup: () => ({
    data: [
      { id: 'm1', displayName: 'Alice' },
      { id: 'm2', displayName: 'Bob' },
    ],
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  }),
  useRecordBulkContributions: () => ({ mutateAsync: mockMutateAsync, isPending: false, isError: false, error: null }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

function renderEntry(meetingId: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <TreasurerMeetingEntryPage params={{ meetingId }} />
    </QueryClientProvider>
  );
}

describe('Treasurer Meeting Entry', () => {
  beforeEach(() => {
    mockMutateAsync.mockClear();
  });

  it('mixed-mode row inputs calculate totals correctly', async () => {
    renderEntry('mtg1');
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });
    const savingsInputs = screen.getAllByLabelText(/savings/i);
    const socialInputs = screen.getAllByLabelText(/social fund/i);
    fireEvent.change(savingsInputs[0], { target: { value: '10' } });
    fireEvent.change(socialInputs[0], { target: { value: '5' } });
    await waitFor(() => {
      expect(screen.getByText(/Total: £15\.00/)).toBeInTheDocument();
    });
  });

  it('batch review shows separate social fund totals', async () => {
    renderEntry('mtg1');
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });
    const savingsInputs = screen.getAllByLabelText(/savings/i);
    const socialInputs = screen.getAllByLabelText(/social fund/i);
    fireEvent.change(savingsInputs[0], { target: { value: '20' } });
    fireEvent.change(socialInputs[0], { target: { value: '10' } });
    fireEvent.change(savingsInputs[1], { target: { value: '5' } });
    fireEvent.change(socialInputs[1], { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: /review and submit/i }));
    await waitFor(() => {
      expect(screen.getByText(/Savings total:/)).toBeInTheDocument();
      expect(screen.getByText(/Social fund total:/)).toBeInTheDocument();
    });
  });

  it('submit payload maps to backend schema including idempotency keys', async () => {
    renderEntry('mtg1');
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });
    const savingsInput = screen.getAllByLabelText(/savings/i)[0];
    fireEvent.change(savingsInput, { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: /review and submit/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /submit batch/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /submit batch/i }));
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
      const payload = mockMutateAsync.mock.calls[0][0];
      expect(payload.meetingId).toBe('mtg1');
      expect(payload.contributions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            memberProfileId: 'm1',
            savingsAmountMinor: 1000,
            socialFundAmountMinor: 0,
            transactionMode: 'CASH',
            idempotencyKey: 'meeting-mtg1-member-m1',
          }),
        ])
      );
    });
  });

  it('sends BANK_TRANSFER and externalReferenceText when second row is bank with text ref', async () => {
    renderEntry('mtg1');
    await waitFor(() => {
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });
    const savingsInputs = screen.getAllByLabelText(/savings/i);
    const socialInputs = screen.getAllByLabelText(/social fund/i);
    fireEvent.change(savingsInputs[1], { target: { value: '20' } });
    fireEvent.change(socialInputs[1], { target: { value: '5' } });
    const bankRadios = screen.getAllByLabelText('Bank transfer');
    fireEvent.click(bankRadios[1]);
    const refInputs = screen.getAllByPlaceholderText(/Text reference/i);
    fireEvent.change(refInputs[1], { target: { value: 'Ref-123' } });
    fireEvent.click(screen.getByRole('button', { name: /review and submit/i }));
    await waitFor(() => {
      expect(screen.getByText(/Cash: 0 · Bank transfer: 1/)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /submit batch/i }));
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
      const payload = mockMutateAsync.mock.calls[0][0];
      const contrib = payload.contributions.find((c: { memberProfileId: string }) => c.memberProfileId === 'm2');
      expect(contrib).toBeDefined();
      expect(contrib.transactionMode).toBe('BANK_TRANSFER');
      expect(contrib.externalReferenceText).toBe('Ref-123');
      expect(contrib.savingsAmountMinor).toBe(2000);
      expect(contrib.socialFundAmountMinor).toBe(500);
    });
  });

  it('shows loading skeleton when members are loading', () => {
    const { useMembersByGroup } = require('@/lib/api/hooks/treasurer');
    useMembersByGroup.mockReturnValue({ data: undefined, isLoading: true, isError: false, refetch: jest.fn() });
    renderEntry('mtg1');
    expect(screen.getByText('Meeting entry')).toBeInTheDocument();
    expect(document.body.querySelector('.loading-skeleton')).not.toBeNull();
  });

  it('shows error state when members fail to load', () => {
    const { useMembersByGroup } = require('@/lib/api/hooks/treasurer');
    useMembersByGroup.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: jest.fn() });
    renderEntry('mtg1');
    expect(screen.getByText(/Could not load members/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});
