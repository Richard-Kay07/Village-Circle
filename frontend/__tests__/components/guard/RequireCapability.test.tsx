import React from 'react';
import { render, screen } from '@testing-library/react';
import { RequireCapability } from '@/components/guard/RequireCapability';
import { CapabilitiesProvider } from '@/lib/context/capabilities-context';

function renderWithCapabilities(capabilities: readonly string[], permission: string) {
  return render(
    <CapabilitiesProvider initial={capabilities}>
      <RequireCapability permission={permission as import('@/lib/types/permissions').Permission}>
        <div data-testid="content">Protected content</div>
      </RequireCapability>
    </CapabilitiesProvider>
  );
}

describe('RequireCapability', () => {
  it('renders children when user has capability', () => {
    renderWithCapabilities(['audit.read'], 'audit.read');
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('shows denied notice when capability missing', () => {
    renderWithCapabilities([], 'audit.read');
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    expect(screen.getByText(/Access restricted|Required/)).toBeInTheDocument();
  });

  it('renders fallback when provided and capability missing', () => {
    render(
      <CapabilitiesProvider initial={[]}>
        <RequireCapability permission="audit.read" fallback={<div data-testid="fallback">No access</div>}>
          <div data-testid="content">Protected</div>
        </RequireCapability>
      </CapabilitiesProvider>
    );
    expect(screen.getByTestId('fallback')).toBeInTheDocument();
    expect(screen.getByText('No access')).toBeInTheDocument();
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });
});
