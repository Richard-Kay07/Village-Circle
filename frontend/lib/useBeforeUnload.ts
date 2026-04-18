'use client';

import { useEffect } from 'react';

/**
 * Prompt user when leaving the page with unsaved changes (e.g. back, refresh, close tab).
 * Only applies when dirty is true. Does not block in-app navigation; for that, use a custom modal.
 */
export function useBeforeUnload(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);
}
