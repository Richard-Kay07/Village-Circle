import React from 'react';
import { render, screen } from '@testing-library/react';
import { FormFlowLayout } from '@/components/layout/FormFlowLayout';

describe('FormFlowLayout', () => {
  it('renders children', () => {
    render(
      <FormFlowLayout>
        <p>Form body</p>
      </FormFlowLayout>
    );
    expect(screen.getByText('Form body')).toBeInTheDocument();
  });

  it('renders sticky action bar when actions provided', () => {
    render(
      <FormFlowLayout
        actions={
          <>
            <button type="button">Cancel</button>
            <button type="button">Submit</button>
          </>
        }
      >
        <p>Form body</p>
      </FormFlowLayout>
    );
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    const actionsRegion = screen.getByRole('group', { name: 'Form actions' });
    expect(actionsRegion).toHaveClass('form-flow-layout__actions');
  });

  it('critical submit action remains in DOM at narrow width (no removal)', () => {
    const { container } = render(
      <FormFlowLayout
        actions={
          <button type="submit" data-testid="primary-submit">Record contribution</button>
        }
      >
        <div>Content</div>
      </FormFlowLayout>
    );
    const submit = screen.getByTestId('primary-submit');
    expect(submit).toBeInTheDocument();
    expect(container.querySelector('.form-flow-layout__actions')).toContainElement(submit);
  });
});
