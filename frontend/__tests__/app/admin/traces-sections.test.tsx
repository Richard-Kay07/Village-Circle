import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminTracesPage from '@/app/admin/traces/page';

jest.mock('@/lib/support/context', () => ({
  useSupportAccess: jest.fn(() => ({
    state: { supportCaseOrIncidentId: 'INC-1', reasonCode: 'TEST', tenantGroupId: 'g1', actorUserId: 'u1' },
    setState: jest.fn(),
    clearState: jest.fn(),
    isActive: true,
  })),
}));

jest.mock('@/lib/api/hooks/support', () => ({
  useContributionTrace: jest.fn(),
  useLoanTrace: jest.fn(),
}));

const mockTrace = {
  entityType: 'CONTRIBUTION',
  entity: { id: 'c1', groupId: 'g1', memberId: 'm1', status: 'RECORDED' },
  auditEvents: [{ id: 'a1', action: 'CONTRIBUTION_RECORDED', entityType: 'CONTRIBUTION', entityId: 'c1', sequenceNo: 1, createdAt: '2025-01-01T12:00:00Z' }],
  ledgerEvents: [{ id: 'le1', sourceEventType: 'CONTRIBUTION_RECORDED', sourceEventId: 'c1', eventTimestamp: '2025-01-01T12:00:00Z' }],
  ledgerLines: [{ ledgerEventId: 'le1', fundBucket: 'SAVINGS', memberId: 'm1', amountMinor: 1000 }],
  evidenceMetadata: [{ id: 'e1', storedPath: '/path', mimeType: 'image/png', sizeBytes: 1024 }],
  notifications: [{ id: 'n1', channel: 'SMS', templateKey: 'receipt_confirmation', status: 'DELIVERED', createdAt: '2025-01-01T12:05:00Z' }],
};

describe('Admin Traces', () => {
  it('shows support gate when support access is not active', () => {
    const { useSupportAccess } = require('@/lib/support/context');
    useSupportAccess.mockReturnValue({
      state: null,
      setState: jest.fn(),
      clearState: jest.fn(),
      isActive: false,
    });
    render(<AdminTracesPage />);
    expect(screen.getByText(/Support access required/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Reason code/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start support access/i })).toBeInTheDocument();
  });

  it('renders linked record sections when trace data is loaded', () => {
    const { useSupportAccess } = require('@/lib/support/context');
    useSupportAccess.mockReturnValue({
      state: { supportCaseOrIncidentId: 'INC-1', reasonCode: 'TEST', tenantGroupId: 'g1', actorUserId: 'u1' },
      setState: jest.fn(),
      clearState: jest.fn(),
      isActive: true,
    });
    const { useContributionTrace, useLoanTrace } = require('@/lib/api/hooks/support');
    useContributionTrace.mockReturnValue({ data: mockTrace, isLoading: false, error: null });
    useLoanTrace.mockReturnValue({ data: null, isLoading: false, error: null });
    render(<AdminTracesPage />);
    const entityIdInput = screen.getByPlaceholderText('UUID');
    const tenantInput = screen.getByPlaceholderText('Group UUID');
    fireEvent.change(entityIdInput, { target: { value: 'c1' } });
    fireEvent.change(tenantInput, { target: { value: 'g1' } });
    fireEvent.click(screen.getByRole('button', { name: /View trace/i }));
    expect(screen.getByText('Entity')).toBeInTheDocument();
    expect(screen.getByText('Ledger events')).toBeInTheDocument();
    expect(screen.getByText('Audit events')).toBeInTheDocument();
    expect(screen.getByText('Evidence metadata')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('shows read-only financial correction warning', () => {
    const { useSupportAccess } = require('@/lib/support/context');
    useSupportAccess.mockReturnValue({
      state: { supportCaseOrIncidentId: 'INC-1', reasonCode: 'TEST', tenantGroupId: 'g1', actorUserId: 'u1' },
      setState: jest.fn(),
      clearState: jest.fn(),
      isActive: true,
    });
    const { useContributionTrace, useLoanTrace } = require('@/lib/api/hooks/support');
    useContributionTrace.mockReturnValue({ data: mockTrace, isLoading: false, error: null });
    useLoanTrace.mockReturnValue({ data: null, isLoading: false, error: null });
    render(<AdminTracesPage />);
    fireEvent.change(screen.getByPlaceholderText('UUID'), { target: { value: 'c1' } });
    fireEvent.change(screen.getByPlaceholderText('Group UUID'), { target: { value: 'g1' } });
    fireEvent.click(screen.getByRole('button', { name: /View trace/i }));
    expect(screen.getByText(/Financial corrections must use reversal or adjustment workflows/)).toBeInTheDocument();
  });
});
