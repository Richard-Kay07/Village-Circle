'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui';
import { useMemberSession } from '@/lib/member/context';

export default function MemberNotificationPreferencesPage() {
  const session = useMemberSession();
  const tenantSmsEnabled = session?.smsNotificationsEnabled !== false;

  return (
    <>
      <PageHeader title="Notification preferences" backHref="/member/notifications" backLabel="Back to Notifications" />
      <section style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
          Some notifications are required for the service (e.g. loan due reminders, security alerts). You can opt out of
          non-critical SMS reminders below when your group has SMS enabled.
        </p>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: tenantSmsEnabled ? 'pointer' : 'not-allowed' }}>
          <input
            type="checkbox"
            disabled={!tenantSmsEnabled}
            defaultChecked={true}
            aria-describedby="sms-desc"
          />
          <span>Receive non-critical SMS reminders</span>
        </label>
        <p id="sms-desc" style={{ fontSize: '0.8125rem', color: '#6b7280', marginTop: '0.25rem', marginLeft: '1.5rem' }}>
          {tenantSmsEnabled
            ? 'Uncheck to stop non-essential text reminders. Mandatory service notifications will still be sent.'
            : 'SMS notifications are disabled for your group. Contact your group administrator to enable them.'}
        </p>
      </section>
    </>
  );
}
