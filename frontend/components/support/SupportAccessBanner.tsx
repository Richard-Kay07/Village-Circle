'use client';

import React from 'react';
import { useSupportAccess } from '@/lib/support/context';

export function SupportAccessBanner() {
  const { state, clearState, isActive } = useSupportAccess();

  if (!isActive || !state) return null;

  return (
    <div
      role="status"
      style={{
        padding: '0.5rem 0.75rem',
        backgroundColor: '#dbeafe',
        border: '1px solid #93c5fd',
        borderRadius: '6px',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}
    >
      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
        Support access active: Case <strong>{state.supportCaseOrIncidentId}</strong> · Reason: {state.reasonCode}
      </span>
      <button
        type="button"
        onClick={clearState}
        style={{ fontSize: '0.8125rem', padding: '0.25rem 0.5rem', cursor: 'pointer' }}
      >
        End session
      </button>
    </div>
  );
}
