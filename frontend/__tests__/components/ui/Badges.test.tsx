/**
 * Badge components: render and map to known enums; Coming Soon is muted.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ModuleBadge, StatusBadge, ChannelBadge, TransactionModeBadge } from '@/components/ui';
import { STATUS_IDS, CHANNEL_IDS, TRANSACTION_MODE_IDS } from '@/lib/design-system/badges';

describe('ModuleBadge', () => {
  it('renders VC Save for save module', () => {
    render(<ModuleBadge moduleId="save" />);
    expect(screen.getByText('VC Save')).toBeInTheDocument();
  });

  it('renders short label when short prop', () => {
    render(<ModuleBadge moduleId="hub" short />);
    expect(screen.getByText('Hub')).toBeInTheDocument();
  });

  it('renders Coming soon for pay/learn by default', () => {
    render(<ModuleBadge moduleId="pay" />);
    expect(screen.getByText(/Coming soon/)).toBeInTheDocument();
  });

  it('renders Soon for pay when short and coming soon', () => {
    render(<ModuleBadge moduleId="learn" short />);
    expect(screen.getByText('Soon')).toBeInTheDocument();
  });

  it('renders VC Grow for grow with default variant', () => {
    render(<ModuleBadge moduleId="grow" variant="default" />);
    expect(screen.getByText('VC Grow')).toBeInTheDocument();
  });
});

describe('StatusBadge', () => {
  it('renders Recorded for recorded status', () => {
    render(<StatusBadge statusId="recorded" />);
    expect(screen.getByText('Recorded')).toBeInTheDocument();
  });

  it('renders all status variants with correct labels', () => {
    const labels: Record<string, string> = {
      recorded: 'Recorded',
      pending: 'Pending',
      approved: 'Approved',
      overdue: 'Overdue',
      reversed: 'Reversed',
      failed: 'Failed',
      delivered: 'Delivered',
    };
    STATUS_IDS.forEach((id) => {
      const { unmount } = render(<StatusBadge statusId={id} />);
      expect(screen.getByText(labels[id])).toBeInTheDocument();
      unmount();
    });
  });
});

describe('ChannelBadge', () => {
  it('renders In-app for in_app channel', () => {
    render(<ChannelBadge channelId="in_app" />);
    expect(screen.getByText('In-app')).toBeInTheDocument();
  });

  it('renders short label when short', () => {
    render(<ChannelBadge channelId="sms" short />);
    expect(screen.getByText('SMS')).toBeInTheDocument();
  });

  it('renders all channel variants', () => {
    const labels: Record<string, string> = { in_app: 'In-app', email: 'Email', sms: 'SMS' };
    CHANNEL_IDS.forEach((id) => {
      const { unmount } = render(<ChannelBadge channelId={id} />);
      expect(screen.getByText(labels[id])).toBeInTheDocument();
      unmount();
    });
  });
});

describe('TransactionModeBadge', () => {
  it('renders Cash for CASH mode', () => {
    render(<TransactionModeBadge mode="CASH" />);
    expect(screen.getByText('Cash')).toBeInTheDocument();
  });

  it('renders Bank transfer for BANK_TRANSFER', () => {
    render(<TransactionModeBadge mode="BANK_TRANSFER" />);
    expect(screen.getByText('Bank transfer')).toBeInTheDocument();
  });

  it('renders short Bank for BANK_TRANSFER when short', () => {
    render(<TransactionModeBadge mode="BANK_TRANSFER" short />);
    expect(screen.getByText('Bank')).toBeInTheDocument();
  });

  it('renders all transaction mode variants', () => {
    const labels: Record<string, string> = { CASH: 'Cash', BANK_TRANSFER: 'Bank transfer' };
    TRANSACTION_MODE_IDS.forEach((mode) => {
      const { unmount } = render(<TransactionModeBadge mode={mode} />);
      expect(screen.getByText(labels[mode])).toBeInTheDocument();
      unmount();
    });
  });
});
