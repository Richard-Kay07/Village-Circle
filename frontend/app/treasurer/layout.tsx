import React from 'react';
import Link from 'next/link';
import { AreaNav } from '@/components/nav/AreaNav';
import { TREASURER_NAV } from '@/lib/navigation/nav-maps';

export default function TreasurerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto', paddingTop: '1rem', paddingBottom: '1rem' }}>
      <header style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>
        <Link href="/" style={{ fontSize: '0.875rem', color: '#6b7280' }}>VillageCircle360</Link>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0.25rem 0 0' }}>{TREASURER_NAV.label}</h2>
        <AreaNav area={TREASURER_NAV} />
      </header>
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}
