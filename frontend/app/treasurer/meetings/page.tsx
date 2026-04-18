'use client';

import React from 'react';
import { PageHeader, EmptyState } from '@/components/ui';
import { getCopy, COPY_KEYS } from '@/lib/copy';

export default function TreasurerMeetingsPage() {
  return (
    <>
      <PageHeader title={getCopy(COPY_KEYS.hub_meetings_page_title)} backHref="/treasurer" backLabel={getCopy(COPY_KEYS.hub_backToDashboard)} />
      <EmptyState title={getCopy(COPY_KEYS.hub_meetings_page_emptyTitle)} description={getCopy(COPY_KEYS.hub_meetings_page_emptyDescription)} />
    </>
  );
}
