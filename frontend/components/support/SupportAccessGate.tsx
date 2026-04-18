'use client';

import React, { useState } from 'react';
import { useSupportAccess } from '@/lib/support/context';
import { getCopy, COPY_KEYS } from '@/lib/copy';

const DEMO_USER_ID = process.env.NEXT_PUBLIC_DEMO_USER_ID ?? 'demo-user';

export interface SupportAccessGateProps {
  children: React.ReactNode;
  title?: string;
}

export function SupportAccessGate({ children, title }: SupportAccessGateProps) {
  const gateTitle = title ?? getCopy(COPY_KEYS.admin_support_gate_title);
  const { state, setState, isActive } = useSupportAccess();
  const [caseId, setCaseId] = useState(state?.supportCaseOrIncidentId ?? '');
  const [reasonCode, setReasonCode] = useState(state?.reasonCode ?? '');
  const [tenantGroupId, setTenantGroupId] = useState(state?.tenantGroupId ?? '');
  const [actorUserId, setActorUserId] = useState(state?.actorUserId ?? DEMO_USER_ID);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedCase = caseId.trim();
    const trimmedReason = reasonCode.trim();
    const trimmedTenant = tenantGroupId.trim();
    const trimmedActor = actorUserId.trim();
    if (!trimmedCase || !trimmedReason || !trimmedTenant || !trimmedActor) {
      setError(getCopy(COPY_KEYS.legal_supportReason_requiredFields));
      return;
    }
    setState({
      supportCaseOrIncidentId: trimmedCase,
      reasonCode: trimmedReason,
      tenantGroupId: trimmedTenant,
      actorUserId: trimmedActor,
    });
  };

  if (isActive) return <>{children}</>;

  return (
    <div style={{ maxWidth: 400, margin: '1rem 0' }}>
      <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>{gateTitle}</h2>
      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
        {getCopy(COPY_KEYS.legal_supportReason_prompt)}
      </p>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>
          {getCopy(COPY_KEYS.legal_supportReason_caseIdLabel)}
          <input
            type="text"
            value={caseId}
            onChange={(e) => setCaseId(e.target.value)}
            placeholder="e.g. INC-001"
            style={{ display: 'block', width: '100%', minHeight: 44, marginTop: '0.25rem', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
          />
        </label>
        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>
          {getCopy(COPY_KEYS.admin_support_gate_reasonCode)}
          <input
            type="text"
            value={reasonCode}
            onChange={(e) => setReasonCode(e.target.value)}
            placeholder="e.g. CUSTOMER_COMPLAINT"
            style={{ display: 'block', width: '100%', minHeight: 44, marginTop: '0.25rem', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
          />
        </label>
        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>
          {getCopy(COPY_KEYS.legal_supportReason_tenantIdLabel)}
          <input
            type="text"
            value={tenantGroupId}
            onChange={(e) => setTenantGroupId(e.target.value)}
            placeholder="Group UUID"
            style={{ display: 'block', width: '100%', minHeight: 44, marginTop: '0.25rem', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
          />
        </label>
        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>
          {getCopy(COPY_KEYS.legal_supportReason_actorIdLabel)}
          <input
            type="text"
            value={actorUserId}
            onChange={(e) => setActorUserId(e.target.value)}
            placeholder="User UUID"
            style={{ display: 'block', width: '100%', minHeight: 44, marginTop: '0.25rem', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
          />
        </label>
        {error && <p style={{ fontSize: '0.875rem', color: '#b91c1c', margin: 0 }}>{error}</p>}
        <button type="submit" style={{ minHeight: 44, padding: '0.5rem 1rem', fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start' }} aria-label={getCopy(COPY_KEYS.admin_support_gate_startAccess)}>
          {getCopy(COPY_KEYS.admin_support_gate_startAccess)}
        </button>
      </form>
    </div>
  );
}
