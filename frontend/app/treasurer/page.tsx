import React from 'react';
import { PageHeader, StatCard } from '@/components/ui';

export default function TreasurerDashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Operations overview" />
      <div style={{ display: 'grid', gap: '1rem' }}>
        <StatCard label="Contributions (today)" value="—" variant="muted" />
        <StatCard label="Pending loans" value="—" variant="muted" />
      </div>
    </>
  );
}
