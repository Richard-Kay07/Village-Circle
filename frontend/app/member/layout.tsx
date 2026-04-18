import React from 'react';
import Link from 'next/link';
import { AreaNav } from '@/components/nav/AreaNav';
import { MEMBER_NAV } from '@/lib/navigation/nav-maps';
import { MemberSessionProvider, DEMO_MEMBER_SESSION } from '@/lib/member/context';

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <MemberSessionProvider value={DEMO_MEMBER_SESSION}>
      <div className="layout-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto', paddingTop: '1rem', paddingBottom: '1rem' }}>
        <header style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>
          <Link href="/" style={{ fontSize: '0.875rem', color: '#6b7280' }}>VillageCircle360</Link>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0.25rem 0 0' }}>{MEMBER_NAV.label}</h2>
          <AreaNav area={MEMBER_NAV} />
        </header>
        <main style={{ flex: 1 }}>{children}</main>
      </div>
    </MemberSessionProvider>
  );
}
