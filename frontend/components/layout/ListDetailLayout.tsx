'use client';

import React from 'react';
import { tokens } from '@/lib/design-system/tokens';

export interface ListDetailLayoutProps {
  /** List pane (e.g. list of contributions, loans) */
  list: React.ReactNode;
  /** Detail pane (e.g. selected item or empty state). On mobile, shown below list when detail visible. */
  detail: React.ReactNode;
  /** When true, detail pane is visible (mobile: stacked below list; desktop: split) */
  showDetail: boolean;
  /** Desktop: width of list pane (e.g. '280px' or '30%'). Default 320px */
  listWidth?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * List + detail layout: mobile stacked (list then detail), desktop split (list left, detail right).
 * Use for contribution list → contribution detail, loan queue → loan detail.
 * Responsive behavior: CSS .list-detail-layout at 768px+ uses row and list width.
 */
export function ListDetailLayout({
  list,
  detail,
  showDetail,
  listWidth = '320px',
  className,
  style,
}: ListDetailLayoutProps) {
  return (
    <div
      className={`list-detail-layout ${className ?? ''}`.trim()}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.space[4],
        width: '100%',
        minHeight: 0,
        ...style,
      }}
      data-list-width={listWidth}
    >
      <div className="list-detail-layout__list" style={{ flex: '0 0 auto', minWidth: 0 }}>
        {list}
      </div>
      {showDetail && (
        <div className="list-detail-layout__detail" style={{ flex: '1 1 auto', minWidth: 0 }}>
          {detail}
        </div>
      )}
    </div>
  );
}
