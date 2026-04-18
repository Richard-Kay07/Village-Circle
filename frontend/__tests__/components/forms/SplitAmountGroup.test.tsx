import React from 'react';
import { render, screen } from '@testing-library/react';
import { SplitAmountGroup } from '@/components/forms/SplitAmountGroup';

describe('SplitAmountGroup', () => {
  it('renders savings and social fund inputs and total', () => {
    render(
      <SplitAmountGroup
        savingsMinor={1000}
        socialFundMinor={500}
        onSavingsChange={() => {}}
        onSocialFundChange={() => {}}
      />
    );
    expect(screen.getByLabelText('Savings')).toBeInTheDocument();
    expect(screen.getByLabelText('Social fund')).toBeInTheDocument();
    expect(screen.getByText(/Total:/)).toBeInTheDocument();
  });

  it('displays computed total (savings + social fund)', () => {
    render(
      <SplitAmountGroup
        savingsMinor={1000}
        socialFundMinor={500}
        onSavingsChange={() => {}}
        onSocialFundChange={() => {}}
        totalLabel="Total"
      />
    );
    expect(screen.getByText('£15.00')).toBeInTheDocument();
  });

  it('shows errors when provided', () => {
    render(
      <SplitAmountGroup
        savingsMinor={0}
        socialFundMinor={0}
        onSavingsChange={() => {}}
        onSocialFundChange={() => {}}
        savingsError="Savings is required"
        socialFundError="Social fund must be 0 or more"
      />
    );
    expect(screen.getByText('Savings is required')).toBeInTheDocument();
    expect(screen.getByText('Social fund must be 0 or more')).toBeInTheDocument();
  });
});
