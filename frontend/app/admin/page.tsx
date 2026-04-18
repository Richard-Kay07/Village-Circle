'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui';
import { useSupportAccess } from '@/lib/support/context';

export default function AdminSupportHomePage() {
  const { isActive } = useSupportAccess();
  return (
    <>
      <PageHeader title="Support home" subtitle="Admin and support tools (reason-coded access)" />
      <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' }}>
        Use the navigation to access audit log, SMS failures, and entity traces. All actions require a reason code and case ID.
      </p>
      {!isActive && (
        <p style={{ fontSize: '0.875rem', color: '#92400e', backgroundColor: '#fef3c7', padding: '0.75rem', borderRadius: '6px' }}>
          Enter support access (case ID and reason code) on the Audit log, SMS failures, or Entity traces page to view tenant data.
        </p>
      )}
      <ul style={{ marginTop: '1rem', paddingLeft: '1.25rem', fontSize: '0.875rem' }}>
        <li><Link href="/admin/audit-log">Audit log</Link> — filter and view audit events</li>
        <li><Link href="/admin/sms-failures">SMS failures</Link> — failed delivery list and retry</li>
        <li><Link href="/admin/traces">Entity traces</Link> — contribution and loan trace by ID</li>
      </ul>
    </>
  );
}
