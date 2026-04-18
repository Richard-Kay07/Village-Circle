import React from 'react';
import { PageHeader } from '@/components/ui';
import { EmptyState } from '@/components/ui';

export default function TreasurerReportsPage() {
  return (
    <>
      <PageHeader title="Reports" backHref="/treasurer" backLabel="Back to Dashboard" />
      <EmptyState title="No reports" description="Export and view reports (placeholder)." />
    </>
  );
}
