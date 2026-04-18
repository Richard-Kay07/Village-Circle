import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReverseRecordDialog } from '@/components/ui/ReverseRecordDialog';

describe('ReverseRecordDialog', () => {
  it('renders title and immutable explanation when open', () => {
    render(
      <ReverseRecordDialog
        open
        title="Reverse contribution"
        immutableExplanation="Reversing creates an audit trail."
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.getByText('Reverse contribution')).toBeInTheDocument();
    expect(screen.getByText('Reversing creates an audit trail.')).toBeInTheDocument();
    expect(screen.getByLabelText(/Reason for reversal/)).toBeInTheDocument();
  });

  it('disables confirm when reason is empty', () => {
    render(
      <ReverseRecordDialog
        open
        title="Reverse"
        immutableExplanation="Explanation"
        confirmLabel="Reverse record"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: 'Reverse record' })).toBeDisabled();
  });

  it('enables confirm when reason is filled and calls onConfirm with trimmed reason', () => {
    const onConfirm = jest.fn();
    render(
      <ReverseRecordDialog
        open
        title="Reverse"
        immutableExplanation="Explanation"
        confirmLabel="Reverse record"
        onConfirm={onConfirm}
        onCancel={() => {}}
      />
    );
    const textarea = screen.getByLabelText(/Reason for reversal/);
    fireEvent.change(textarea, { target: { value: '  Wrong amount  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Reverse record' }));
    expect(onConfirm).toHaveBeenCalledWith('Wrong amount');
  });

  it('calls onCancel when cancel is clicked', () => {
    const onCancel = jest.fn();
    render(
      <ReverseRecordDialog
        open
        title="Reverse"
        immutableExplanation="Explanation"
        onConfirm={() => {}}
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('does not render when open is false', () => {
    render(
      <ReverseRecordDialog
        open={false}
        title="Reverse"
        immutableExplanation="Explanation"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.queryByText('Reverse')).not.toBeInTheDocument();
  });
});
