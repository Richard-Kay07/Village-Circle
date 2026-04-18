'use client';

import React from 'react';
import { PageHeader, EmptyState } from '@/components/ui';
import { RequireCapability } from '@/components/guard';
import { getCopy, COPY_KEYS } from '@/lib/copy';

export function GuardedAuditPage() {
  return (
    <RequireCapability permission="audit.read">
      <PageHeader title={getCopy(COPY_KEYS.hub_audit_log_title)} backHref="/treasurer" backLabel={getCopy(COPY_KEYS.hub_backToDashboard)} />
      <EmptyState title={getCopy(COPY_KEYS.hub_audit_log_title)} description={getCopy(COPY_KEYS.hub_audit_log_placeholderDescription)} />
    </RequireCapability>
  );
}
