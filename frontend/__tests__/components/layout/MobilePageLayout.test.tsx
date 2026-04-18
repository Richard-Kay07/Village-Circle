import React from 'react';
import { render, screen } from '@testing-library/react';
import { MobilePageLayout } from '@/components/layout/MobilePageLayout';

describe('MobilePageLayout', () => {
  it('renders children and has layout-container class', () => {
    render(
      <MobilePageLayout>
        <span>Page content</span>
      </MobilePageLayout>
    );
    expect(screen.getByText('Page content')).toBeInTheDocument();
    const wrapper = screen.getByText('Page content').closest('.layout-container');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper?.classList.contains('mobile-page-layout')).toBe(true);
  });

  it('applies maxWidth style', () => {
    const { container } = render(
      <MobilePageLayout maxWidth={400}>
        <span>Content</span>
      </MobilePageLayout>
    );
    const el = container.querySelector('.mobile-page-layout');
    expect(el).toHaveStyle({ maxWidth: 400 });
  });
});
