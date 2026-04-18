import React from 'react';
import { render, screen } from '@testing-library/react';
import { ContributionListCard } from '@/components/layout/ContributionListCard';

describe('ContributionListCard', () => {
  it('renders title and link', () => {
    render(
      <ContributionListCard href="/c/1" title="Alice" />
    );
    const link = screen.getByRole('link', { name: /Alice/ });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/c/1');
  });

  it('renders amount summary and date', () => {
    render(
      <ContributionListCard
        href="/c/1"
        title="Bob"
        amountSummary="£50 savings · £10 social"
        dateText="1 Jan 2025"
      />
    );
    expect(screen.getByText(/£50 savings · £10 social/)).toBeInTheDocument();
    expect(screen.getByText(/1 Jan 2025/)).toBeInTheDocument();
  });

  it('renders status and transaction mode badges', () => {
    render(
      <ContributionListCard
        href="/c/1"
        title="Carol"
        statusId="recorded"
        transactionMode="BANK_TRANSFER"
      />
    );
    expect(screen.getByText('Recorded')).toBeInTheDocument();
    expect(screen.getByText('Bank')).toBeInTheDocument();
  });
});
