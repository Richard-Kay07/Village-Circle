'use client';

import React from 'react';
import { tokens } from '@/lib/design-system/tokens';
import { ChannelBadge } from '@/components/ui';

export interface NotificationListRowProps {
  title: string;
  /** e.g. "2 hours ago" */
  timeText?: string;
  channelId?: 'in_app' | 'email' | 'sms';
  read?: boolean;
  onClick?: () => void;
  href?: string;
  children?: React.ReactNode;
}

/**
 * Row for notifications list. Mobile-friendly; optional channel badge.
 */
export function NotificationListRow({
  title,
  timeText,
  channelId,
  read = false,
  onClick,
  href,
  children,
}: NotificationListRowProps) {
  const content = (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: tokens.space[2], marginBottom: tokens.space[1] }}>
        {channelId && <ChannelBadge channelId={channelId} short />}
        <span style={{ fontWeight: read ? tokens.font.weight.normal : tokens.font.weight.medium, fontSize: tokens.font.size.base }}>
          {title}
        </span>
      </div>
      {timeText && (
        <div style={{ fontSize: tokens.font.size.sm, color: tokens.semantic.text.muted }}>{timeText}</div>
      )}
      {children}
    </>
  );

  const baseStyle: React.CSSProperties = {
    display: 'block',
    padding: tokens.space[3],
    borderBottom: `1px solid ${tokens.semantic.border.default}`,
    textDecoration: 'none',
    color: 'inherit',
    opacity: read ? 0.85 : 1,
    minWidth: 0,
  };

  if (href) {
    return (
      <a href={href} className="notification-list-row break-word" style={baseStyle}>
        {content}
      </a>
    );
  }
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="notification-list-row break-word"
        style={{ ...baseStyle, width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
      >
        {content}
      </button>
    );
  }
  return (
    <div className="notification-list-row break-word" style={baseStyle}>
      {content}
    </div>
  );
}
