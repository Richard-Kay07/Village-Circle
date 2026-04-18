'use client';

import React from 'react';
import Link from 'next/link';
import { tokens } from '@/lib/design-system/tokens';
import { TimelineItem, TraceableIdDisplay } from '@/components/ui';

export default function StatusTimelinePage() {
  const longId = 'cont_01HQXYZ1234567890abcdef';

  return (
    <div className="layout-container" style={{ paddingTop: tokens.space[6], paddingBottom: tokens.space[8] }}>
      <div style={{ display: 'flex', gap: tokens.space[4], marginBottom: tokens.space[4], flexWrap: 'wrap' }}>
        <Link href="/" style={{ color: tokens.color.primary, fontSize: tokens.font.size.base }}>← Back</Link>
        <Link href="/design-system/tokens" style={{ color: tokens.color.primary, fontSize: tokens.font.size.base }}>Tokens</Link>
        <Link href="/design-system/badges" style={{ color: tokens.color.primary, fontSize: tokens.font.size.base }}>Badges</Link>
      </div>
      <h1 style={{ fontSize: tokens.font.size['2xl'], fontWeight: tokens.font.weight.bold, marginBottom: tokens.space[2] }}>
        Status & timeline presentation
      </h1>
      <p style={{ color: tokens.semantic.text.secondary, marginBottom: tokens.space[6] }}>
        Status vocabulary, TimelineItem, TraceableIdDisplay, immutable messaging. See docs/STATUS_TIMELINE_PRESENTATION.md.
      </p>

      <section style={{ marginBottom: tokens.space[8] }}>
        <h2 style={{ fontSize: tokens.font.size.lg, fontWeight: tokens.font.weight.semibold, marginBottom: tokens.space[4] }}>
          TraceableIdDisplay (long ID)
        </h2>
        <p style={{ marginBottom: tokens.space[2], fontSize: tokens.font.size.sm }}>Truncation, copy, expand:</p>
        <TraceableIdDisplay value={longId} />
      </section>

      <section style={{ marginBottom: tokens.space[8] }}>
        <h2 style={{ fontSize: tokens.font.size.lg, fontWeight: tokens.font.weight.semibold, marginBottom: tokens.space[4] }}>
          Example: Contribution reversal timeline
        </h2>
        <div style={{ border: `1px solid ${tokens.semantic.border.default}`, borderRadius: tokens.radius.md, overflow: 'hidden' }}>
          <TimelineItem
            actionLabel="CONTRIBUTION_RECORDED"
            actor="Treasurer"
            time="2 Jan 2025 14:30"
            statusId="recorded"
            entityHref="/treasurer/contributions/c1"
            entityId={longId}
            metadataSummary="£20.00 · Cash"
          />
          <TimelineItem
            actionLabel="CONTRIBUTION_REVERSED"
            actor="Treasurer"
            time="16 Jan 2025 10:00"
            statusId="reversed"
            entityHref="/treasurer/contributions/c1"
            entityId={longId}
            metadataSummary="Reversal of duplicate entry."
            details={
              <>
                <p style={{ margin: 0 }}><strong>Reason:</strong> Duplicate entry.</p>
                <p style={{ margin: '0.25rem 0 0' }}>Original record preserved. History visible for audit.</p>
              </>
            }
            defaultExpanded={false}
          />
        </div>
      </section>

      <section style={{ marginBottom: tokens.space[8] }}>
        <h2 style={{ fontSize: tokens.font.size.lg, fontWeight: tokens.font.weight.semibold, marginBottom: tokens.space[4] }}>
          Example: Loan approval → disbursement → repayment
        </h2>
        <div style={{ border: `1px solid ${tokens.semantic.border.default}`, borderRadius: tokens.radius.md, overflow: 'hidden' }}>
          <TimelineItem actionLabel="LOAN_APPLICATION_SUBMITTED" actor="Member" time="1 Jan 2025 09:00" statusId="pending" metadataSummary="£500 requested" />
          <TimelineItem actionLabel="LOAN_APPROVED" actor="Treasurer" time="3 Jan 2025 11:00" statusId="approved" metadataSummary="Approved for £500" />
          <TimelineItem actionLabel="LOAN_DISBURSEMENT_RECORDED" actor="Treasurer" time="5 Jan 2025 14:00" statusId="recorded" metadataSummary="Disbursement recorded" />
          <TimelineItem actionLabel="LOAN_REPAYMENT_RECORDED" actor="Treasurer" time="2 Mar 2025 16:00" statusId="recorded" metadataSummary="£100 repayment" />
        </div>
      </section>

      <section style={{ marginBottom: tokens.space[8] }}>
        <h2 style={{ fontSize: tokens.font.size.lg, fontWeight: tokens.font.weight.semibold, marginBottom: tokens.space[4] }}>
          Example: Admin evidence access event
        </h2>
        <div style={{ border: `1px solid ${tokens.semantic.border.default}`, borderRadius: tokens.radius.md, overflow: 'hidden' }}>
          <TimelineItem
            actionLabel="SUPPORT_ACCESS_STARTED"
            actor="Support (admin)"
            time="2 Mar 2025 10:15"
            statusId="recorded"
            metadataSummary="Reason: member query"
          />
          <TimelineItem
            actionLabel="SUPPORT_EVIDENCE_VIEWED"
            actor="Support (admin)"
            time="2 Mar 2025 10:16"
            statusId="recorded"
            entityHref="/admin/evidence/ev_abc"
            entityId="ev_01HQXYZ789"
            metadataSummary="Evidence viewed for contribution c1"
            details={<p style={{ margin: 0 }}>Audit view; access logged.</p>}
          />
        </div>
      </section>

      <section style={{ marginBottom: tokens.space[8] }}>
        <h2 style={{ fontSize: tokens.font.size.lg, fontWeight: tokens.font.weight.semibold, marginBottom: tokens.space[4] }}>
          Example: SMS delivery webhook events
        </h2>
        <div style={{ border: `1px solid ${tokens.semantic.border.default}`, borderRadius: tokens.radius.md, overflow: 'hidden' }}>
          <TimelineItem
            actionLabel="SMS_WEBHOOK_DELIVERED"
            time="2 Mar 2025 12:00:05"
            statusId="delivered"
            metadataSummary="Provider ref: msg_xyz"
            details={<p style={{ margin: 0 }}>Webhook received; delivery confirmed.</p>}
          />
          <TimelineItem
            actionLabel="SMS_WEBHOOK_FAILED"
            time="2 Mar 2025 12:01:00"
            statusId="failed"
            metadataSummary="Invalid number"
            details={<p style={{ margin: 0 }}>Error: Invalid number. Retry or update contact.</p>}
          />
        </div>
      </section>
    </div>
  );
}
