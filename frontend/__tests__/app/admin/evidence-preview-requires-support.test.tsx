import React from 'react';
import { render, screen } from '@testing-library/react';
import AdminEvidencePage from '@/app/admin/evidence/[id]/page';

jest.mock('@/lib/support/context', () => ({
  useSupportAccess: jest.fn(() => ({
    state: null,
    setState: jest.fn(),
    clearState: jest.fn(),
    isActive: false,
  })),
}));

jest.mock('@/lib/api/hooks/support', () => ({
  useSupportEvidence: jest.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
    isError: false,
  })),
}));

describe('Admin Evidence Preview requires support context', () => {
  it('shows support gate when not active', () => {
    render(<AdminEvidencePage params={{ id: 'ev-1' }} />);
    expect(screen.getByText(/Support access required/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start support access/i })).toBeInTheDocument();
  });

  it('shows audit warning when support active and data loaded', () => {
    const { useSupportAccess } = require('@/lib/support/context');
    const { useSupportEvidence } = require('@/lib/api/hooks/support');
    useSupportAccess.mockReturnValue({
      state: { supportCaseOrIncidentId: 'INC-1', reasonCode: 'TEST', tenantGroupId: 'g1', actorUserId: 'u1' },
      isActive: true,
    });
    useSupportEvidence.mockReturnValue({
      data: { id: 'ev-1', mimeType: 'image/png', sizeBytes: 1024, createdAt: '2025-01-01T12:00:00Z' },
      isLoading: false,
      isError: false,
    });
    render(<AdminEvidencePage params={{ id: 'ev-1' }} />);
    expect(screen.getByText(/This view is audited/)).toBeInTheDocument();
  });
});
