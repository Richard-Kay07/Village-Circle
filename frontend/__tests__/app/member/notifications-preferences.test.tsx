import React from 'react';
import { render, screen } from '@testing-library/react';
import MemberNotificationPreferencesPage from '@/app/member/notifications/preferences/page';

jest.mock('@/lib/member/context', () => ({
  useMemberSession: jest.fn(),
}));

const useMemberSession = require('@/lib/member/context').useMemberSession;

describe('MemberNotificationPreferencesPage', () => {
  it('disables SMS opt-out toggle when tenant SMS is disabled', () => {
    (useMemberSession as jest.Mock).mockReturnValue({ smsNotificationsEnabled: false });
    render(<MemberNotificationPreferencesPage />);
    const checkbox = screen.getByRole('checkbox', { name: /receive non-critical sms reminders/i });
    expect(checkbox).toBeDisabled();
  });

  it('enables SMS opt-out toggle when tenant SMS is enabled', () => {
    (useMemberSession as jest.Mock).mockReturnValue({ smsNotificationsEnabled: true });
    render(<MemberNotificationPreferencesPage />);
    const checkbox = screen.getByRole('checkbox', { name: /receive non-critical sms reminders/i });
    expect(checkbox).not.toBeDisabled();
  });
});
