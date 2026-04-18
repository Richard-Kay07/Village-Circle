import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TreasurerLoanRepayPage from '@/app/treasurer/loans/loan/[loanId]/repay/page';

jest.mock('@/lib/api/hooks/treasurer', () => ({
  useTreasurerGroupId: () => 'g1',
  useRecordLoanRepayment: jest.fn(),
}));

jest.mock('@/lib/api/hooks/member', () => ({
  useLoanDetail: jest.fn(),
}));

const mockMutateAsync = jest.fn();
const mockRefetch = jest.fn();

function renderRepayPage(loanId: string, overrides?: { state?: string; outstanding?: number; repayments?: unknown[] }) {
  const { useLoanDetail } = require('@/lib/api/hooks/member');
  const principal = 10000;
  const totalRepaid = overrides?.outstanding != null ? principal - overrides.outstanding : 0;
  useLoanDetail.mockReturnValue({
    data: {
      id: loanId,
      groupId: 'g1',
      principalAmountMinor: principal,
      totalRepaidMinor: totalRepaid,
      state: overrides?.state ?? 'ACTIVE',
      scheduleItems: [],
      repayments: overrides?.repayments ?? [],
    },
    isLoading: false,
    isError: false,
    refetch: mockRefetch.mockResolvedValue({
      data: {
        repayments: overrides?.repayments ?? [],
      },
    }),
  });

  const { useRecordLoanRepayment } = require('@/lib/api/hooks/treasurer');
  useRecordLoanRepayment.mockReturnValue({
    mutateAsync: mockMutateAsync,
    isPending: false,
    isError: false,
    error: null,
  });

  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <TreasurerLoanRepayPage params={{ loanId }} />
    </QueryClientProvider>
  );
}

describe('Treasurer Loan Repayment', () => {
  beforeEach(() => {
    mockMutateAsync.mockReset();
    mockRefetch.mockReset();
  });

  it('sends correct cash repayment payload on submit', async () => {
    mockMutateAsync.mockResolvedValue({ id: 'r1', createdAt: '2025-01-01T12:00:00Z' });
    renderRepayPage('loan-1', { outstanding: 5000 });

    const amountInput = screen.getByLabelText(/amount/i);
    fireEvent.change(amountInput, { target: { value: '25.00' } });
    fireEvent.click(screen.getByRole('button', { name: /record repayment/i }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    });
    const payload = mockMutateAsync.mock.calls[0][0];
    expect(payload.transactionMode).toBe('CASH');
    expect(payload.amountMinor).toBe(2500);
    expect(payload.loanId).toBe('loan-1');
    expect(payload.tenantGroupId).toBe('g1');
    expect(payload.idempotencyKey).toBeDefined();
    expect(typeof payload.idempotencyKey).toBe('string');
  });

  it('sends cash repayment with text reference when provided', async () => {
    mockMutateAsync.mockResolvedValue({ id: 'r1', createdAt: '2025-01-01T12:00:00Z' });
    renderRepayPage('loan-1', { outstanding: 5000 });
    const amountInput = screen.getByLabelText(/amount/i);
    fireEvent.change(amountInput, { target: { value: '15.00' } });
    const textArea = document.querySelector('textarea');
    if (textArea) fireEvent.change(textArea, { target: { value: 'Receipt #456' } });
    fireEvent.click(screen.getByRole('button', { name: /record repayment/i }));
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    });
    const payload = mockMutateAsync.mock.calls[0][0];
    expect(payload.transactionMode).toBe('CASH');
    expect(payload.externalReferenceText).toBe('Receipt #456');
  });

  it('sends bank transfer with image evidence payload when provided', async () => {
    mockMutateAsync.mockResolvedValue({ id: 'r1', createdAt: '2025-01-01T12:00:00Z' });
    renderRepayPage('loan-1', { outstanding: 5000 });

    const amountInput = screen.getByLabelText(/amount/i);
    fireEvent.change(amountInput, { target: { value: '10.00' } });
    const modeSelect = screen.getByRole('combobox', { name: /transaction mode/i }) || document.getElementById('repay-mode');
    if (modeSelect) fireEvent.change(modeSelect, { target: { value: 'BANK_TRANSFER' } });
    const textArea = document.querySelector('textarea');
    if (textArea) fireEvent.change(textArea, { target: { value: 'Ref 123' } });
    fireEvent.click(screen.getByRole('button', { name: /record repayment/i }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    });
    const payload = mockMutateAsync.mock.calls[0][0];
    expect(payload.transactionMode).toBe('BANK_TRANSFER');
    expect(payload.amountMinor).toBe(1000);
    expect(payload.externalReferenceText).toBe('Ref 123');
  });

  it('disables submit button while pending', async () => {
    const { useRecordLoanRepayment } = require('@/lib/api/hooks/treasurer');
    useRecordLoanRepayment.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
      isError: false,
      error: null,
    });
    const { useLoanDetail } = require('@/lib/api/hooks/member');
    useLoanDetail.mockReturnValue({
      data: { id: 'loan-1', groupId: 'g1', principalAmountMinor: 10000, totalRepaidMinor: 5000, state: 'ACTIVE', scheduleItems: [], repayments: [] },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <TreasurerLoanRepayPage params={{ loanId: 'loan-1' }} />
      </QueryClientProvider>
    );
    const btn = screen.getByRole('button', { name: /recording/i });
    expect(btn).toBeDisabled();
  });

  it('shows allocation summary when backend returns repayments after submit', async () => {
    mockMutateAsync.mockResolvedValue({ id: 'r1', createdAt: '2025-01-01T12:00:00Z' });
    mockRefetch.mockResolvedValue({
      data: {
        repayments: [
          {
            id: 'r1',
            amountMinor: 1000,
            principalMinor: 800,
            interestMinor: 150,
            penaltyMinor: 50,
            transactionMode: 'CASH',
            externalReferenceText: null,
            evidencePresence: { hasText: false, hasImage: false },
            recordedAt: '2025-01-01T12:00:00Z',
            type: 'REPAYMENT',
          },
        ],
      },
    });

    const { useLoanDetail } = require('@/lib/api/hooks/member');
    useLoanDetail.mockReturnValue({
      data: {
        id: 'loan-1',
        groupId: 'g1',
        principalAmountMinor: 10000,
        totalRepaidMinor: 0,
        state: 'ACTIVE',
        scheduleItems: [],
        repayments: [],
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });

    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <TreasurerLoanRepayPage params={{ loanId: 'loan-1' }} />
      </QueryClientProvider>
    );

    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '10.00' } });
    fireEvent.click(screen.getByRole('button', { name: /record repayment/i }));

    await waitFor(() => {
      expect(screen.getByText(/repayment recorded successfully/i)).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText(/principal £8\.00/i)).toBeInTheDocument();
      expect(screen.getByText(/interest £1\.50/i)).toBeInTheDocument();
      expect(screen.getByText(/penalty £0\.50/i)).toBeInTheDocument();
    });
  });

  it('shows already recorded message when duplicate idempotency response', async () => {
    mockMutateAsync.mockRejectedValue(Object.assign(new Error('Already recorded'), { status: 409 }));
    renderRepayPage('loan-1', { outstanding: 5000 });

    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '5.00' } });
    fireEvent.click(screen.getByRole('button', { name: /record repayment/i }));

    await waitFor(() => {
      expect(screen.getByText(/already recorded/i)).toBeInTheDocument();
    });
  });
});
