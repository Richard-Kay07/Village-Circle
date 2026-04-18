'use client';

import React from 'react';
import { tokens } from '@/lib/design-system/tokens';

export interface MobilePageLayoutProps {
  children: React.ReactNode;
  /** Optional max-width in px; default from breakpoint.mobile (430) */
  maxWidth?: number;
  /** Padding bottom to allow for sticky bars or safe area */
  paddingBottom?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Mobile-first page wrapper: single column, constrained width, safe horizontal padding.
 * Use for member and treasurer app screens.
 */
export function MobilePageLayout({
  children,
  maxWidth = tokens.breakpoint.mobile,
  paddingBottom = tokens.space[8],
  className,
  style,
}: MobilePageLayoutProps) {
  return (
    <div
      className={`layout-container mobile-page-layout ${className ?? ''}`.trim()}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: maxWidth,
        margin: '0 auto',
        paddingTop: tokens.space[4],
        paddingBottom,
        width: '100%',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
