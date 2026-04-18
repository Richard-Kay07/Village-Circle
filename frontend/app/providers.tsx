'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CapabilitiesProvider } from '@/lib/context/capabilities-context';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60 * 1000, retry: 1 },
  },
});

const DEV_CAPABILITIES = [
  'contribution.record',
  'loan.apply',
  'loan.repayment.record',
  'contribution.reverse',
  'loan.approve',
  'loan.disbursement.record',
  'loan.waive',
  'loan.writeoff',
  'loan.reschedule',
  'meeting.record',
  'report.export',
  'audit.read',
  'admin.support_access',
] as const;

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <CapabilitiesProvider initial={DEV_CAPABILITIES}>
        {children}
      </CapabilitiesProvider>
    </QueryClientProvider>
  );
}
