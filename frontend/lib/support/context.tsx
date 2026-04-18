'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { SupportAccessState } from './types';
import { supportStorage } from './types';

interface SupportAccessContextValue {
  /** Current support access state; null when not in a support session. */
  state: SupportAccessState | null;
  /** Set and persist support access (case ID, reason code, tenant, actor). */
  setState: (state: SupportAccessState) => void;
  /** Clear support access for the session. */
  clearState: () => void;
  /** True when state is set (reason-coded access active). */
  isActive: boolean;
}

const SupportAccessContext = createContext<SupportAccessContextValue | null>(null);

function initialState(): SupportAccessState | null {
  return supportStorage.load();
}

export function SupportAccessProvider({ children }: { children: React.ReactNode }) {
  const [state, setStateInternal] = useState<SupportAccessState | null>(initialState);

  const setState = useCallback((next: SupportAccessState) => {
    setStateInternal(next);
    supportStorage.save(next);
  }, []);

  const clearState = useCallback(() => {
    setStateInternal(null);
    supportStorage.save(null);
  }, []);

  const value = useMemo(
    () => ({
      state,
      setState,
      clearState,
      isActive: state !== null,
    }),
    [state, setState, clearState]
  );

  return (
    <SupportAccessContext.Provider value={value}>
      {children}
    </SupportAccessContext.Provider>
  );
}

export function useSupportAccess(): SupportAccessContextValue {
  const ctx = useContext(SupportAccessContext);
  if (!ctx) {
    return {
      state: null,
      setState: () => {},
      clearState: () => {},
      isActive: false,
    };
  }
  return ctx;
}
