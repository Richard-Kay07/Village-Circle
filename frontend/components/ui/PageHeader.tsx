import React from 'react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, backHref, backLabel = 'Back', children }: PageHeaderProps) {
  return (
    <header className="page-header" style={{ marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>
      {backHref && <a href={backHref} style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, marginBottom: '0.5rem', fontSize: '0.875rem', color: '#2563eb' }}>{backLabel}</a>}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{title}</h1>
        {children}
      </div>
      {subtitle && <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#6b7280' }}>{subtitle}</p>}
    </header>
  );
}
