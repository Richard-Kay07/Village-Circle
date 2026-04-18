import React from 'react';
import { render, screen } from '@testing-library/react';
import AdminSmsFailuresPage from '@/app/admin/sms-failures/page';

jest.mock('@/lib/support/context', () => ({
  useSupportAccess: jest.fn(() => ({
    state: { supportCaseOrIncidentId: 'INC-1', reasonCode: 'TEST', tenantGroupId: 'g1', actorUserId: 'u1' },
    isActive: true,
  })),
}));

jest.mock('@/lib/context/capabilities-context', () => ({
  useCapabilities: jest.fn(() => []),
}));

jest.mock('@/lib/api/hooks/support', () => ({
  useSupportSmsFailures: jest.fn(() => ({
    data: {
      items: [
        { id: 'n1', tenantGroupId: 'g1', recipientMemberId: 'm1', templateKey: 'receipt_confirmation', status: 'FAILED', errorCode: 'ERR', errorMessage: 'Failed', retryCount: 1, createdAt: '2025-01-01T12:00:00Z' },
      ],
      nextCursor: null,
    },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
  useRetryNotification: jest.fn(() => ({ mutate: jest.fn(), isPending: false })),
}));

describe('Admin SMS Failures', () => {
  it('hides retry button when user lacks notification.resend permission', () => {
    render(<AdminSmsFailuresPage />);
    expect(screen.getByText(/failed notification/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Retry/i })).not.toBeInTheDocument();
  });

  it('shows retry button when user has notification.resend', () => {
    const { useCapabilities } = require('@/lib/context/capabilities-context');
    useCapabilities.mockReturnValue(['notification.resend']);
    render(<AdminSmsFailuresPage />);
    expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
  });
});
