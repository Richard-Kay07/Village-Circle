import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MemberLoanRequestPage from '@/app/member/loans/request/page';

jest.mock('@/lib/member/context', () => ({
  useMemberSession: jest.fn(() => ({ groupId: 'g1', memberId: 'm1' })),
}));

jest.mock('@/lib/api/hooks/member', () => ({
  useLoanRuleHints: jest.fn(() => ({ data: null })),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

const mockPost = jest.fn();
jest.mock('@/lib/api/client', () => ({
  apiClient: { post: (...args: unknown[]) => mockPost(...args) },
}));

function renderLoanRequest() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false }, queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemberLoanRequestPage />
    </QueryClientProvider>
  );
}

describe('Member Loan Request', () => {
  beforeEach(() => {
    mockPost.mockReset();
  });

  it('shows validation errors when amount is missing and user continues', async () => {
    renderLoanRequest();
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    await waitFor(() => {
      expect(screen.getByText(/amount is required/i)).toBeInTheDocument();
    });
  });

  it('shows validation error when term is invalid', async () => {
    renderLoanRequest();
    const amountInput = document.getElementById('loan-amount');
    if (amountInput) {
      fireEvent.change(amountInput, { target: { value: '50' } });
    }
    const termInput = screen.getByPlaceholderText(/e.g. 12/i);
    fireEvent.change(termInput, { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    await waitFor(() => {
      expect(screen.getByText(/whole number of periods|term is required/i)).toBeInTheDocument();
    });
  });

  it('calls API with correct payload on successful submit', async () => {
    mockPost.mockResolvedValue({ id: 'app-1' });
    const push = jest.fn();
    require('next/navigation').useRouter.mockReturnValue({ push });

    renderLoanRequest();
    const termInput = screen.getByPlaceholderText(/e.g. 12/i);
    fireEvent.change(termInput, { target: { value: '12' } });
    const amountInput = screen.getByLabelText(/requested amount/i);
    fireEvent.change(amountInput, { target: { value: '100.00' } });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/confirm your application/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /submit application/i }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        'loans/applications',
        expect.objectContaining({
          tenantGroupId: 'g1',
          memberProfileId: 'm1',
          requestedAmountMinor: expect.any(Number),
          requestedTermPeriods: 12,
          submittedByUserId: expect.any(String),
        }),
        expect.any(Object)
      );
    });
    const payload = mockPost.mock.calls[0][1];
    expect(payload.requestedAmountMinor).toBeGreaterThanOrEqual(100);
  });

  it('shows domain error message when API returns validation error', async () => {
    mockPost.mockRejectedValue(
      Object.assign(new Error('Member not found or not active'), { status: 400, code: 'VALIDATION_ERROR' })
    );

    renderLoanRequest();
    const termInput = screen.getByPlaceholderText(/e.g. 12/i);
    fireEvent.change(termInput, { target: { value: '12' } });
    const amountInput = screen.getByLabelText(/requested amount/i);
    fireEvent.change(amountInput, { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /submit application/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /submit application/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/member not found or not active/i);
    });
  });
});
