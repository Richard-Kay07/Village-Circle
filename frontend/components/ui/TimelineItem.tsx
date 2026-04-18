'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { tokens } from '@/lib/design-system/tokens';
import { StatusBadge } from '@/components/ui';
import { TraceableIdDisplay } from '@/components/ui/TraceableIdDisplay';
import { getAuditActionLabel } from '@/lib/status-vocabulary';
import type { StatusId } from '@/lib/design-system/tokens';

export interface TimelineItemProps {
  /** Human-readable action (e.g. "Contribution recorded") or audit action key (e.g. CONTRIBUTION_RECORDED) */
  actionLabel: string;
  /** Actor name or "By Jane" */
  actor?: string;
  /** Formatted time (e.g. "2 Jan 2025 14:30") */
  time: string;
  /** Optional status for badge */
  statusId?: StatusId;
  /** Entity link (e.g. /treasurer/contributions/123) */
  entityHref?: string;
  /** Entity ID for display (truncated + copy when long) */
  entityId?: string;
  /** One-line metadata summary */
  metadataSummary?: string;
  /** Expandable details (e.g. reason, payload summary) */
  details?: React.ReactNode;
  /** When true, details are shown by default */
  defaultExpanded?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Timeline event item: action label, actor, time, optional status badge, entity link/id, metadata, expandable details.
 * Use for contribution reversal timeline, loan approval/disbursement/repayment, admin evidence access, SMS webhook events.
 */
export function TimelineItem({
  actionLabel,
  actor,
  time,
  statusId,
  entityHref,
  entityId,
  metadataSummary,
  details,
  defaultExpanded = false,
  className,
  style,
}: TimelineItemProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasExpandable = details != null;

  const displayAction = getAuditActionLabel(actionLabel);

  return (
    <div
      className={`timeline-item break-word ${className ?? ''}`.trim()}
      style={{
        padding: tokens.space[3],
        borderBottom: `1px solid ${tokens.semantic.border.default}`,
        minWidth: 0,
        ...style,
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: tokens.space[2], marginBottom: tokens.space[1] }}>
        <span style={{ fontWeight: tokens.font.weight.medium, fontSize: tokens.font.size.sm }}>
          {displayAction}
        </span>
        {statusId && <StatusBadge statusId={statusId} short />}
      </div>
      {(actor || time) && (
        <div style={{ fontSize: tokens.font.size.xs, color: tokens.semantic.text.muted, marginBottom: metadataSummary ? tokens.space[1] : 0 }}>
          {actor && <span>{actor}</span>}
          {actor && time && ' · '}
          {time && <time dateTime={time}>{time}</time>}
        </div>
      )}
      {metadataSummary && (
        <div style={{ fontSize: tokens.font.size.sm, color: tokens.semantic.text.secondary, marginBottom: (entityHref || entityId || hasExpandable) ? tokens.space[2] : 0 }}>
          {metadataSummary}
        </div>
      )}
      {(entityHref || entityId) && (
        <div style={{ fontSize: tokens.font.size.xs, marginBottom: hasExpandable ? tokens.space[2] : 0 }}>
          {entityHref && (
            <Link href={entityHref} style={{ color: tokens.semantic.action.primary.bg, marginRight: entityId ? tokens.space[2] : 0 }}>
              View record
            </Link>
          )}
          {entityId && (
            <TraceableIdDisplay value={entityId} expandThreshold={20} />
          )}
        </div>
      )}
      {hasExpandable && (
        <>
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            style={{
              fontSize: tokens.font.size.xs,
              color: tokens.semantic.text.secondary,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              textDecoration: 'underline',
            }}
          >
            {expanded ? 'Hide details' : 'Show details'}
          </button>
          {expanded && (
            <div style={{ marginTop: tokens.space[2], padding: tokens.space[2], backgroundColor: tokens.semantic.surface.muted, borderRadius: tokens.radius.sm, fontSize: tokens.font.size.xs }}>
              {details}
            </div>
          )}
        </>
      )}
    </div>
  );
}
