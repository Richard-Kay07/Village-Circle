import React from 'react';
import { render, screen } from '@testing-library/react';
import { InlineStatusMessage } from '@/components/ui/InlineStatusMessage';

describe('InlineStatusMessage', () => {
  it('renders children for each variant', () => {
    (['success', 'warning', 'error', 'info'] as const).forEach((variant) => {
      const { unmount } = render(
        <InlineStatusMessage variant={variant}>Message for {variant}</InlineStatusMessage>
      );
      expect(screen.getByText(`Message for ${variant}`)).toBeInTheDocument();
      unmount();
    });
  });

  it('renders title when provided', () => {
    render(
      <InlineStatusMessage variant="warning" title="Important">
        Details here.
      </InlineStatusMessage>
    );
    expect(screen.getByText('Important')).toBeInTheDocument();
    expect(screen.getByText('Details here.')).toBeInTheDocument();
  });

  it('has role="alert" for error variant', () => {
    render(<InlineStatusMessage variant="error">Error text</InlineStatusMessage>);
    expect(screen.getByRole('alert')).toHaveTextContent('Error text');
  });
});
