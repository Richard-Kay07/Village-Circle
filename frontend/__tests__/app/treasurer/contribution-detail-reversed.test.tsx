import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TreasurerContributionDetailPage from '@/app/treasurer/contributions/[id]/page';

jest.mock('@/lib/context/capabilities-context', () => ({
  useCapabilities: jest.fn(() => []),
}));

jest.mock('@/lib/api/hooks/treasurer', () => ({
  useTreasurerGroupId: () => 'g1',
  useContributionDetailTreasurer: jest.fn(),
  useReversalContribution: () => ({ mutateAsync: jest.fn(), isPending: false, isError: false, error: null }),
}));

jest.mock('@/lib/api/hooks/evidence', () => ({
  useEvidenceMetadata: () => ({ data: null, isError: false }),
}));

function renderDetail(id: string, overrides?: { status?: string; reversedAt?: string; reversalReason?: string }) {
  const { useContributionDetailTreasurer } = require('@/lib/api/hooks/treasurer');
  useContributionDetailTreasurer.mockReturnValue({
    data: {
      id,
      tenantGroupId: 'g1',
      meetingId: 'm1',
      memberProfileId: 'mem1',
      transactionMode: 'CASH',
      savingsAmountMinor: 1000,
      socialFundAmountMinor: 500,
      totalAmountMinor: 1500,
      externalReferenceText: null,
      evidenceAttachmentId: null,
      status: overrides?.status ?? 'RECORDED',
      recordedByUserId: 'u1',
      recordedAt: '2025-01-15T12:00:00Z',
      reversedByUserId: null,
      reversedAt: overrides?.reversedAt ?? null,
      reversalReason: overrides?.reversalReason ?? null,
      ledgerEventId: null,
      idempotencyKey: null,
      createdAt: '2025-01-15T12:00:00Z',
    },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  });

  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <TreasurerContributionDetailPage params={{ id }} />
    </QueryClientProvider>
  );
}

describe('Treasurer Contribution Detail (reversed)', () => {
  it('shows immutable history message when contribution is reversed', async () => {
    renderDetail('c1', { status: 'REVERSED', reversedAt: '2025-01-16T10:00:00Z', reversalReason: 'Duplicate entry' });
    await waitFor(() => {
      expect(screen.getByText(/This record has been reversed\. History is preserved for audit\./)).toBeInTheDocument();
    });
  });

  it('shows reversal details when reversed', async () => {
    renderDetail('c1', { status: 'REVERSED', reversedAt: '2025-01-16T10:00:00Z', reversalReason: 'Duplicate entry' });
    await waitFor(() => {
      expect(screen.getByText(/Reversal details/)).toBeInTheDocument();
      expect(screen.getByText(/Duplicate entry/)).toBeInTheDocument();
    });
  });

  it('does not show immutable history message when status is RECORDED', async () => {
    renderDetail('c1', { status: 'RECORDED' });
    await waitFor(() => {
      expect(screen.getByText(/Contribution/)).toBeInTheDocument();
    });
    expect(screen.queryByText(/This record has been reversed\. History is preserved for audit\./)).not.toBeInTheDocument();
  });
});
