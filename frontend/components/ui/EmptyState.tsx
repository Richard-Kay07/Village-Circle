import React from 'react';

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="empty-state" style={styles.wrapper}>
      {icon && <div style={styles.icon}>{icon}</div>}
      <h2 className="empty-state__title" style={styles.title}>
        {title}
      </h2>
      {description && (
        <p className="empty-state__description" style={styles.description}>
          {description}
        </p>
      )}
      {action && <div style={styles.action}>{action}</div>}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    textAlign: 'center',
    padding: '2rem 1.5rem',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px dashed #d1d5db',
  },
  icon: {
    marginBottom: '1rem',
    color: '#9ca3af',
    fontSize: '2rem',
  },
  title: {
    fontSize: '1.125rem',
    fontWeight: 600,
    margin: '0 0 0.5rem',
    color: '#374151',
  },
  description: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: '0 0 1rem',
    maxWidth: '20rem',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  action: {
    marginTop: '1rem',
  },
};
