import React from 'react';
import { render, screen } from '@testing-library/react';
import { CopyText } from '@/components/ui/CopyText';
import { COPY_KEYS } from '@/lib/copy';

describe('CopyText', () => {
  it('renders copy from key by default', () => {
    render(<CopyText copyKey={COPY_KEYS.common_button_retry} />);
    expect(screen.getByText('Try again')).toBeInTheDocument();
  });

  it('renders fallback when provided', () => {
    render(<CopyText copyKey={COPY_KEYS.common_button_retry} fallback="Retry" />);
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('renders as p when as="p"', () => {
    render(<CopyText copyKey={COPY_KEYS.member_dashboard_title} as="p" />);
    const el = screen.getByText('Dashboard');
    expect(el.tagName).toBe('P');
  });

  it('applies className and style', () => {
    render(
      <CopyText
        copyKey={COPY_KEYS.common_loading}
        className="loading-copy"
        style={{ fontWeight: 600 }}
      />
    );
    const el = screen.getByText('Loading…');
    expect(el).toHaveClass('loading-copy');
    expect(el).toHaveStyle({ fontWeight: '600' });
  });
});
