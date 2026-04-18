'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader, EmptyState, LoadingSkeleton } from '@/components/ui';

export default function MemberNotificationsPage() {
  const loading = false;
  const items: Array<{ id: string; channel: string; title: string; read: boolean; at: string }> = [];

  if (loading) {
    return (
      <>
        <PageHeader title="Notifications" />
        <LoadingSkeleton variant="card" />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Notifications"
        actions={
          <Link href="/member/notifications/preferences" style={{ fontSize: '0.875rem', color: '#2563eb' }}>
            Preferences
          </Link>
        }
      />
      {items.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="In-app, email and SMS notifications will appear here when the feature is available."
        />
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {items.map((n) => (
            <li
              key={n.id}
              style={{
                padding: '0.75rem 0',
                borderBottom: '1px solid #e5e7eb',
                opacity: n.read ? 0.8 : 1,
              }}
            >
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{n.channel}</span>
              <div style={{ fontWeight: 500 }}>{n.title}</div>
              <span style={{ fontSize: '0.8125rem', color: '#6b7280' }}>{n.at}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
