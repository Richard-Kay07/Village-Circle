'use client';

import React from 'react';
import { getCopy, COPY_KEYS } from '@/lib/copy';

export interface PermissionDeniedNoticeProps {
  title?: string;
  message?: string;
  requiredPermission?: string;
}

const wrapperStyle: React.CSSProperties = { textAlign: 'center', padding: '2rem 1.5rem', backgroundColor: '#fffbeb', borderRadius: '8px', border: '1px solid #fcd34d' };
const titleStyle: React.CSSProperties = { fontSize: '1.125rem', fontWeight: 600, margin: '0 0 0.5rem', color: '#92400e' };
const messageStyle: React.CSSProperties = { fontSize: '0.875rem', color: '#78350f', margin: '0 0 0.5rem' };
const hintStyle: React.CSSProperties = { fontSize: '0.75rem', color: '#a16207', margin: 0 };

export function PermissionDeniedNotice({
  title,
  message,
  requiredPermission,
}: PermissionDeniedNoticeProps) {
  const titleText = title ?? getCopy(COPY_KEYS.hub_permission_denied_title);
  const messageText = message ?? getCopy(COPY_KEYS.hub_permission_denied_message);
  const contactHint = getCopy(COPY_KEYS.hub_permission_denied_contactAdmin);

  return (
    <div className="permission-denied-notice" style={wrapperStyle}>
      <h2 className="permission-denied-notice__title" style={titleStyle}>{titleText}</h2>
      <p className="permission-denied-notice__message" style={messageStyle}>{messageText}</p>
      <p className="permission-denied-notice__hint" style={hintStyle}>{contactHint}</p>
      {requiredPermission && <p className="permission-denied-notice__required" style={hintStyle}>Required: {requiredPermission}</p>}
    </div>
  );
}
