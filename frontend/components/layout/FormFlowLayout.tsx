'use client';

import React from 'react';
import { tokens } from '@/lib/design-system/tokens';

export interface FormFlowLayoutProps {
  children: React.ReactNode;
  /** Sticky bottom action bar (primary submit, cancel). Kept in thumb zone on mobile. */
  actions?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Form flow: main content + optional sticky action bar at bottom.
 * Use for meeting entry, record repayment, and other key forms to keep primary actions visible.
 */
export function FormFlowLayout({ children, actions, className, style }: FormFlowLayoutProps) {
  return (
    <div
      className={`form-flow-layout ${className ?? ''}`.trim()}
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        flex: 1,
        ...style,
      }}
    >
      <div className="form-flow-layout__content" style={{ flex: '1 1 auto', minHeight: 0, paddingBottom: actions ? tokens.space[4] : 0 }}>
        {children}
      </div>
      {actions && (
        <div className="form-flow-layout__actions" role="group" aria-label="Form actions">
          {actions}
        </div>
      )}
    </div>
  );
}
