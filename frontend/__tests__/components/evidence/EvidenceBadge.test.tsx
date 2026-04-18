import React from 'react';
import { render, screen } from '@testing-library/react';
import { EvidenceBadge } from '@/components/evidence/EvidenceBadge';

describe('EvidenceBadge', () => {
  it('shows No evidence when no text or image', () => {
    render(<EvidenceBadge />);
    expect(screen.getByText('No evidence')).toBeInTheDocument();
  });

  it('shows Text when textRef only', () => {
    render(<EvidenceBadge textRef="Ref 123" />);
    expect(screen.getByText('Text')).toBeInTheDocument();
  });

  it('shows Image when hasImage only', () => {
    render(<EvidenceBadge hasImage />);
    expect(screen.getByText('Image')).toBeInTheDocument();
  });

  it('shows Text + Image when both', () => {
    render(<EvidenceBadge textRef="Ref" hasImage />);
    expect(screen.getByText('Text + Image')).toBeInTheDocument();
  });
});
