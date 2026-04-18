'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';
import type { Capabilities, Permission } from '@/lib/types/permissions';
import { hasCapability } from '@/lib/types/permissions';

interface CapabilitiesContextValue {
  capabilities: Capabilities;
  setCapabilities: (c: Capabilities) => void;
  has: (permission: Permission) => boolean;
}

const CapabilitiesContext = createContext<CapabilitiesContextValue | null>(null);

const DEFAULT_CAPABILITIES: Capabilities = [];

export function CapabilitiesProvider({
  children,
  initial = DEFAULT_CAPABILITIES,
}: {
  children: React.ReactNode;
  initial?: Capabilities;
}) {
  const [capabilities, setCapabilities] = useState<Capabilities>(initial);
  const value = useMemo(
    () => ({
      capabilities,
      setCapabilities,
      has: (permission: Permission) => hasCapability(capabilities, permission),
    }),
    [capabilities]
  );
  return (
    <CapabilitiesContext.Provider value={value}>
      {children}
    </CapabilitiesContext.Provider>
  );
}

export function useCapabilities(): Capabilities {
  const ctx = useContext(CapabilitiesContext);
  if (!ctx) return DEFAULT_CAPABILITIES;
  return ctx.capabilities;
}

export function useCapabilitiesContext(): CapabilitiesContextValue {
  const ctx = useContext(CapabilitiesContext);
  if (!ctx) {
    return {
      capabilities: DEFAULT_CAPABILITIES,
      setCapabilities: () => {},
      has: () => false,
    };
  }
  return ctx;
}
