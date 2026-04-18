'use client';

import React from 'react';
import type { Permission } from '@/lib/types/permissions';
import { useCapabilitiesContext } from '@/lib/context/capabilities-context';
import { PermissionDeniedNotice } from '@/components/ui/PermissionDeniedNotice';

export interface RequireCapabilityProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Client-side convenience guard. Hides or replaces content when the user lacks the required capability.
 * Backend remains source of truth; this is for UX only.
 */
export function RequireCapability({ permission, children, fallback }: RequireCapabilityProps) {
  const { has } = useCapabilitiesContext();
  if (has(permission)) return <>{children}</>;
  if (fallback !== undefined) return <>{fallback}</>;
  return <PermissionDeniedNotice requiredPermission={permission} />;
}
