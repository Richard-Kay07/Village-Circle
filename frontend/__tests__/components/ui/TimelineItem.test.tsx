import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimelineItem } from '@/components/ui/TimelineItem';

const longId = 'cont_01HQXYZ1234567890abcdef';

describe('TimelineItem', () => {
  it('renders action label, actor, time, status badge, and metadata summary', () => {
    render(
      <TimelineItem
        actionLabel="CONTRIBUTION_RECORDED"
        actor="Treasurer"
        time="2 Jan 2025 14:30"
        statusId="recorded"
        metadataSummary="£20.00 · Cash"
      />
    );
    expect(screen.getByText('Contribution recorded')).toBeInTheDocument();
    expect(screen.getByText(/Treasurer/)).toBeInTheDocument();
    expect(screen.getByText('2 Jan 2025 14:30')).toBeInTheDocument();
    expect(screen.getByText('£20.00 · Cash')).toBeInTheDocument();
  });

  it('renders entity ID with Copy button (long ID truncated by default)', () => {
    render(
      <TimelineItem
        actionLabel="CONTRIBUTION_REVERSED"
        time="16 Jan 2025 10:00"
        entityId={longId}
      />
    );
    expect(screen.getByText(/cont_01H.cdef/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Copy/ })).toBeInTheDocument();
  });

  it('shows expand control when details are provided', () => {
    render(
      <TimelineItem
        actionLabel="CONTRIBUTION_REVERSED"
        time="16 Jan 2025"
        details={<p>Reversal reason: Duplicate.</p>}
      />
    );
    expect(screen.getByRole('button', { name: 'Show details' })).toBeInTheDocument();
    expect(screen.queryByText('Reversal reason: Duplicate.')).not.toBeInTheDocument();
  });

  it('expand shows full details and full ID when expanded', () => {
    render(
      <TimelineItem
        actionLabel="CONTRIBUTION_REVERSED"
        time="16 Jan 2025"
        entityId={longId}
        details={<p>Reversal reason: Duplicate.</p>}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Show details' }));
    expect(screen.getByText('Reversal reason: Duplicate.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hide details' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show full' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Show full' }));
    expect(screen.getByText(longId)).toBeInTheDocument();
  });
});
