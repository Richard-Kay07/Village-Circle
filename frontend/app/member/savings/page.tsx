import React from 'react';
import { PageHeader } from '@/components/ui';
import { EmptyState } from '@/components/ui';

export default function MemberSavingsPage() {
  return (
    <>
      <PageHeader title="Savings" backHref="/member" backLabel="Back to Home" />
      <EmptyState title="No contributions yet" description="Your recorded savings will appear here." />
    </>
  );
}
