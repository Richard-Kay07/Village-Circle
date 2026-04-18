'use client';

import React from 'react';
import { tokens } from '@/lib/design-system/tokens';

export interface AdminConsoleLayoutProps {
  children: React.ReactNode;
  /** Max width in px; default 640 (web-first but responsive) */
  maxWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Admin/support console layout: slightly wider than mobile (640px default), responsive.
 * Use for admin support screens; avoid horizontal scroll for core workflows.
 */
export function AdminConsoleLayout({
  children,
  maxWidth = 640,
  className,
  style,
}: AdminConsoleLayoutProps) {
  return (
    <div
      className={`layout-container admin-console-layout ${className ?? ''}`.trim()}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: maxWidth,
        margin: '0 auto',
        paddingTop: tokens.space[4],
        paddingBottom: tokens.space[8],
        width: '100%',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
