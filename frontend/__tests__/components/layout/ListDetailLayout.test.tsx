import React from 'react';
import { render, screen } from '@testing-library/react';
import { ListDetailLayout } from '@/components/layout/ListDetailLayout';

describe('ListDetailLayout', () => {
  it('renders list and detail when showDetail is true', () => {
    render(
      <ListDetailLayout
        list={<div>List pane</div>}
        detail={<div>Detail pane</div>}
        showDetail
      />
    );
    expect(screen.getByText('List pane')).toBeInTheDocument();
    expect(screen.getByText('Detail pane')).toBeInTheDocument();
  });

  it('renders only list when showDetail is false', () => {
    render(
      <ListDetailLayout
        list={<div>List pane</div>}
        detail={<div>Detail pane</div>}
        showDetail={false}
      />
    );
    expect(screen.getByText('List pane')).toBeInTheDocument();
    expect(screen.queryByText('Detail pane')).not.toBeInTheDocument();
  });
});
