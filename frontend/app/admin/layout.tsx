'use client';

import React from 'react';
import Link from 'next/link';
import { AreaNav } from '@/components/nav/AreaNav';
import { ADMIN_NAV } from '@/lib/navigation/nav-maps';
import { SupportAccessProvider } from '@/lib/support/context';
import { SupportAccessBanner } from '@/components/support/SupportAccessBanner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SupportAccessProvider>
      <div className="layout-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', maxWidth: 640, margin: '0 auto', paddingTop: '1rem', paddingBottom: '1rem' }}>
        <header style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>
          <Link href="/" style={{ fontSize: '0.875rem', color: '#6b7280' }}>VillageCircle360</Link>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0.25rem 0 0' }}>{ADMIN_NAV.label}</h2>
          <AreaNav area={ADMIN_NAV} />
        </header>
        <SupportAccessBanner />
        <main style={{ flex: 1 }}>{children}</main>
      </div>
    </SupportAccessProvider>
  );
}
