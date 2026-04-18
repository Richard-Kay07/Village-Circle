import React from 'react';
import { render, screen } from '@testing-library/react';
import { CurrencyAmountField } from '@/components/forms/CurrencyAmountField';

describe('CurrencyAmountField', () => {
  it('renders label and passes error to CurrencyInput', () => {
    render(
      <CurrencyAmountField
        label="Amount"
        valueMinor={0}
        onChangeMinor={() => {}}
        error="Amount is required"
      />
    );
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Amount is required')).toBeInTheDocument();
  });

  it('renders helper text when provided and no error', () => {
    render(
      <CurrencyAmountField
        label="Amount"
        valueMinor={0}
        onChangeMinor={() => {}}
        helperText="Enter amount in pounds"
      />
    );
    expect(screen.getByText('Enter amount in pounds')).toBeInTheDocument();
  });

  it('does not render helper text when error is set', () => {
    render(
      <CurrencyAmountField
        label="Amount"
        valueMinor={0}
        onChangeMinor={() => {}}
        helperText="Enter amount in pounds"
        error="Invalid"
      />
    );
    expect(screen.getByText('Invalid')).toBeInTheDocument();
    expect(screen.queryByText('Enter amount in pounds')).not.toBeInTheDocument();
  });
});
