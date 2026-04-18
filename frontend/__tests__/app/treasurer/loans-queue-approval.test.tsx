import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TreasurerLoansPage from '@/app/treasurer/loans/page';
import TreasurerLoanApplicationDetailPage from '@/app/treasurer/loans/application/[id]/page';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn(), replace: jest.fn() })),
  usePathname: jest.fn(() => '/treasurer/loans'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

const mockRefetch = jest.fn();
jest.mock('@/lib/api/hooks/treasurer', () => ({
  useTreasurerGroupId: () => 'g1',
  useLoanApplicationsByGroup: jest.fn(() => ({
    data: [],
    isLoading: false,
    isError: false,
    refetch: mockRefetch,
  })),
  useLoanApplicationDetail: jest.fn(),
  useApproveLoanApplication: jest.fn(),
  useRejectLoanApplication: jest.fn(),
}));

jest.mock('@/lib/context/capabilities-context', () => ({
  useCapabilities: jest.fn(() => []),
}));

function renderLoansPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <TreasurerLoansPage />
    </QueryClientProvider>
  );
}

describe('Treasurer Loans Queue', () => {
  it('shows queue section and status filter', () => {
    renderLoansPage();
    expect(screen.getByText('Queue')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    const select = screen.getByRole('combobox', { name: /status/i }) ?? document.querySelector('select');
    expect(select).toBeTruthy();
  });

  it('shows loading skeleton when list is loading', () => {
    const { useLoanApplicationsByGroup } = require('@/lib/api/hooks/treasurer');
    useLoanApplicationsByGroup.mockReturnValue({ data: undefined, isLoading: true, isError: false, refetch: mockRefetch });
    renderLoansPage();
    expect(screen.getByText('Loans')).toBeInTheDocument();
    expect(document.body.querySelector('.loading-skeleton')).not.toBeNull();
  });

  it('shows error state when list fails', () => {
    const { useLoanApplicationsByGroup } = require('@/lib/api/hooks/treasurer');
    useLoanApplicationsByGroup.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: mockRefetch });
    renderLoansPage();
    expect(screen.getByText(/Could not load loan applications/i)).toBeInTheDocument();
  });

  it('renders submitted applications with link to detail', async () => {
    const { useLoanApplicationsByGroup } = require('@/lib/api/hooks/treasurer');
    useLoanApplicationsByGroup.mockReturnValue({
      data: [
        {
          id: 'app-1',
          memberDisplayName: 'Jane Doe',
          requestedAmountMinor: 50000,
          requestedTermPeriods: 12,
          submittedAt: '2025-01-10T14:00:00Z',
          status: 'SUBMITTED',
          eligibilityHint: null,
          riskFlags: [],
        },
      ],
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });
    renderLoansPage();
    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });
    expect(screen.getByText('SUBMITTED')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /jane doe/i }) ?? screen.getByText('Jane Doe').closest('a');
    expect(link).toHaveAttribute('href', '/treasurer/loans/application/app-1');
  });
});

describe('Treasurer Loan Application Detail (approval visibility)', () => {
  const mockApprove = jest.fn();
  const mockReject = jest.fn();

  function renderApplicationDetail(id: string, overrides?: { status?: string; canApprove?: boolean }) {
    const { useLoanApplicationDetail, useApproveLoanApplication, useRejectLoanApplication } = require('@/lib/api/hooks/treasurer');
    const { useCapabilities } = require('@/lib/context/capabilities-context');
    useLoanApplicationDetail.mockReturnValue({
      data: {
        id,
        groupId: 'g1',
        memberId: 'm1',
        member: { displayName: 'Jane Doe' },
        requestedAmountMinor: 50000,
        requestedTermPeriods: 12,
        submittedAt: '2025-01-10T14:00:00Z',
        status: overrides?.status ?? 'SUBMITTED',
        purpose: null,
        ruleSnapshot: { loanInterestEnabled: false, loanInterestRateBps: 0, loanInterestBasis: 'REDUCING_BALANCE' },
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });
    useApproveLoanApplication.mockReturnValue({
      mutateAsync: mockApprove.mockResolvedValue({ id: 'loan-1' }),
      isPending: false,
      isError: false,
      error: null,
    });
    useRejectLoanApplication.mockReturnValue({
      mutateAsync: mockReject.mockResolvedValue(undefined),
      isPending: false,
      isError: false,
      error: null,
    });
    useCapabilities.mockReturnValue(overrides?.canApprove !== false ? ['loan.approve'] : []);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    return render(
      <QueryClientProvider client={client}>
        <TreasurerLoanApplicationDetailPage params={{ id }} />
      </QueryClientProvider>
    );
  }

  beforeEach(() => {
    mockApprove.mockClear();
    mockReject.mockClear();
  });

  it('shows application details and approval section when SUBMITTED and user has loan.approve', async () => {
    renderApplicationDetail('app-1', { status: 'SUBMITTED', canApprove: true });
    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });
    expect(screen.getByText('Approvals')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument();
  });

  it('shows view-only message when user lacks loan.approve', async () => {
    renderApplicationDetail('app-1', { status: 'SUBMITTED', canApprove: false });
    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });
    expect(screen.getByText('View only')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /approve/i })).not.toBeInTheDocument();
  });

  it('calls approve API when Approve is confirmed', async () => {
    renderApplicationDetail('app-1', { status: 'SUBMITTED', canApprove: true });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /approve loan/i }));
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /approve application/i })).toBeInTheDocument();
    });
    const dialog = screen.getByRole('dialog', { name: /approve application/i });
    fireEvent.click(within(dialog).getByRole('button', { name: /approve/i }));
    await waitFor(() => {
      expect(mockApprove).toHaveBeenCalledWith('app-1');
    });
  });
});
