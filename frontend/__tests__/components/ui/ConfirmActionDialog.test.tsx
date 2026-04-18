import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmActionDialog } from '@/components/ui/ConfirmActionDialog';

describe('ConfirmActionDialog', () => {
  it('renders title and body when open', () => {
    render(
      <ConfirmActionDialog
        open
        title="Confirm action"
        body="This will do something."
        confirmLabel="Do it"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.getByText('Confirm action')).toBeInTheDocument();
    expect(screen.getByText('This will do something.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Do it' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('calls onConfirm when confirm is clicked', () => {
    const onConfirm = jest.fn();
    render(
      <ConfirmActionDialog
        open
        title="Confirm"
        body="Body"
        confirmLabel="Confirm"
        onConfirm={onConfirm}
        onCancel={() => {}}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel is clicked', () => {
    const onCancel = jest.fn();
    render(
      <ConfirmActionDialog
        open
        title="Confirm"
        body="Body"
        confirmLabel="Confirm"
        onConfirm={() => {}}
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('does not render when open is false', () => {
    render(
      <ConfirmActionDialog
        open={false}
        title="Confirm"
        body="Body"
        confirmLabel="Confirm"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.queryByText('Confirm')).not.toBeInTheDocument();
  });

  it('shows consequence text when provided', () => {
    render(
      <ConfirmActionDialog
        open
        title="Confirm"
        body="Body"
        consequenceText="This cannot be undone."
        confirmLabel="Confirm"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
  });

  it('disables confirm until checkbox is checked when requireCheckbox is set', () => {
    render(
      <ConfirmActionDialog
        open
        title="Confirm"
        body="Body"
        confirmLabel="Delete"
        requireCheckbox={{ label: 'I understand this cannot be undone.' }}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    const confirmBtn = screen.getByRole('button', { name: 'Delete' });
    expect(confirmBtn).toBeDisabled();
    fireEvent.click(screen.getByRole('checkbox'));
    expect(confirmBtn).not.toBeDisabled();
  });

  it('disables confirm and shows Please wait when confirming is true', () => {
    render(
      <ConfirmActionDialog
        open
        title="Confirm"
        body="Body"
        confirmLabel="Submit"
        confirming
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: 'Please wait…' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Please wait…' })).toBeDisabled();
  });
});
