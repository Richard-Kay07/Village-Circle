import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TransactionModeSelector } from '@/components/forms/TransactionModeSelector';

describe('TransactionModeSelector', () => {
  it('renders Cash and Bank transfer options', () => {
    render(
      <TransactionModeSelector value="CASH" onChange={() => {}} />
    );
    expect(screen.getByLabelText('Cash')).toBeInTheDocument();
    expect(screen.getByLabelText('Bank transfer')).toBeInTheDocument();
  });

  it('shows Cash as checked when value is CASH', () => {
    render(
      <TransactionModeSelector value="CASH" onChange={() => {}} />
    );
    expect(screen.getByRole('radio', { name: 'Cash' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Bank transfer' })).not.toBeChecked();
  });

  it('calls onChange with BANK_TRANSFER when Bank transfer is selected', () => {
    const onChange = jest.fn();
    render(
      <TransactionModeSelector value="CASH" onChange={onChange} />
    );
    fireEvent.click(screen.getByRole('radio', { name: 'Bank transfer' }));
    expect(onChange).toHaveBeenCalledWith('BANK_TRANSFER');
  });

  it('displays error when provided', () => {
    render(
      <TransactionModeSelector value="CASH" onChange={() => {}} error="Select a transaction mode" />
    );
    expect(screen.getByText('Select a transaction mode')).toBeInTheDocument();
  });
});
