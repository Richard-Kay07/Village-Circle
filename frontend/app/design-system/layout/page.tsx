'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { tokens } from '@/lib/design-system/tokens';
import {
  MobilePageLayout,
  ListDetailLayout,
  FormFlowLayout,
  AdminConsoleLayout,
  ContributionListCard,
  LoanListCard,
  NotificationListRow,
  AuditEventRow,
  TotalsByBucketCard,
  TransactionModeCountStrip,
  StatusSummaryStrip,
} from '@/components/layout';
import { PageHeader } from '@/components/ui';
import { formatGBP } from '@/lib/format';

export default function LayoutPatternsPage() {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <div className="layout-container" style={{ paddingTop: tokens.space[6], paddingBottom: tokens.space[8] }}>
      <div style={{ display: 'flex', gap: tokens.space[4], marginBottom: tokens.space[4], flexWrap: 'wrap' }}>
        <Link href="/design-system/tokens" style={{ color: tokens.color.primary, fontSize: tokens.font.size.base }}>Tokens</Link>
        <Link href="/design-system/badges" style={{ color: tokens.color.primary, fontSize: tokens.font.size.base }}>Badges</Link>
      </div>
      <h1 style={{ fontSize: tokens.font.size['2xl'], fontWeight: tokens.font.weight.bold, marginBottom: tokens.space[2] }}>
        Mobile-first layout patterns
      </h1>
      <p style={{ color: tokens.semantic.text.secondary, marginBottom: tokens.space[6] }}>
        Layout templates, list/card patterns, summary strips. See docs/MOBILE_FIRST_LAYOUT.md.
      </p>

      <section style={{ marginBottom: tokens.space[8] }}>
        <h2 style={{ fontSize: tokens.font.size.lg, fontWeight: tokens.font.weight.semibold, marginBottom: tokens.space[4] }}>
          MobilePageLayout (member/treasurer)
        </h2>
        <MobilePageLayout maxWidth={400}>
          <PageHeader title="Example screen" subtitle="Single column, constrained width" />
          <p style={{ fontSize: tokens.font.size.sm, color: tokens.semantic.text.muted }}>Content area. No horizontal scroll.</p>
        </MobilePageLayout>
      </section>

      <section style={{ marginBottom: tokens.space[8] }}>
        <h2 style={{ fontSize: tokens.font.size.lg, fontWeight: tokens.font.weight.semibold, marginBottom: tokens.space[4] }}>
          ListDetailLayout (mobile stacked, desktop split)
        </h2>
        <ListDetailLayout
          showDetail={showDetail}
          list={
            <div>
              <button type="button" onClick={() => setShowDetail(true)} style={{ marginBottom: tokens.space[2], fontSize: tokens.font.size.sm }}>Item 1</button>
              <LoanListCard href="#" title="Loan – Member A" amountSummary="£500" dateText="1 Jan 2025" statusId="approved" />
            </div>
          }
          detail={
            <div style={{ padding: tokens.space[4], border: `1px solid ${tokens.semantic.border.default}`, borderRadius: tokens.radius.md }}>
              <p>Detail pane. On desktop this sits to the right of the list.</p>
              <button type="button" onClick={() => setShowDetail(false)} style={{ fontSize: tokens.font.size.sm }}>Close</button>
            </div>
          }
        />
      </section>

      <section style={{ marginBottom: tokens.space[8] }}>
        <h2 style={{ fontSize: tokens.font.size.lg, fontWeight: tokens.font.weight.semibold, marginBottom: tokens.space[4] }}>
          FormFlowLayout with sticky actions
        </h2>
        <FormFlowLayout
          actions={
            <div style={{ display: 'flex', gap: tokens.space[3], justifyContent: 'flex-end' }}>
              <button type="button" style={{ padding: `${tokens.space[2]} ${tokens.space[4]}` }}>Cancel</button>
              <button type="button" style={{ padding: `${tokens.space[2]} ${tokens.space[4]}`, background: tokens.semantic.action.primary.bg, color: tokens.semantic.action.primary.text, border: 'none', borderRadius: tokens.radius.md }}>Submit</button>
            </div>
          }
        >
          <p style={{ marginBottom: tokens.space[4] }}>Form content. Primary actions stay in thumb zone at bottom.</p>
        </FormFlowLayout>
      </section>

      <section style={{ marginBottom: tokens.space[8] }}>
        <h2 style={{ fontSize: tokens.font.size.lg, fontWeight: tokens.font.weight.semibold, marginBottom: tokens.space[4] }}>
          VC Save – Contribution list cards + summary
        </h2>
        <ContributionListCard href="#" title="Alice" amountSummary="£50 savings · £10 social" dateText="1 Jan 2025" statusId="recorded" transactionMode="CASH" />
        <ContributionListCard href="#" title="Bob" amountSummary="£30 savings · £5 social" dateText="1 Jan 2025" statusId="recorded" transactionMode="BANK_TRANSFER" />
        <TotalsByBucketCard
          buckets={[{ label: 'Savings total', valueFormatted: formatGBP(8000) }, { label: 'Social fund total', valueFormatted: formatGBP(1500) }]}
          totalLabel="Total"
          totalFormatted={formatGBP(9500)}
        />
        <TransactionModeCountStrip counts={[{ mode: 'CASH', label: 'Cash', count: 3, amountFormatted: '£90' }, { mode: 'BANK_TRANSFER', label: 'Bank transfer', count: 2, amountFormatted: '£50' }]} />
      </section>

      <section style={{ marginBottom: tokens.space[8] }}>
        <h2 style={{ fontSize: tokens.font.size.lg, fontWeight: tokens.font.weight.semibold, marginBottom: tokens.space[4] }}>
          VC Grow – Loan list cards
        </h2>
        <LoanListCard href="#" title="Member A" amountSummary="£500 balance" dateText="Due 15 Jan" statusId="approved" subtitle="Application approved" />
        <LoanListCard href="#" title="Member B" amountSummary="£200 balance" dateText="Overdue" statusId="overdue" />
      </section>

      <section style={{ marginBottom: tokens.space[8] }}>
        <h2 style={{ fontSize: tokens.font.size.lg, fontWeight: tokens.font.weight.semibold, marginBottom: tokens.space[4] }}>
          Notifications + Audit timeline
        </h2>
        <NotificationListRow title="Loan due reminder" timeText="2 hours ago" channelId="in_app" />
        <NotificationListRow title="Contribution recorded" timeText="1 day ago" channelId="sms" read />
        <div style={{ marginTop: tokens.space[4] }}>
          <h3 style={{ fontSize: tokens.font.size.base, marginBottom: tokens.space[2] }}>Audit events</h3>
          <AuditEventRow eventType="Contribution recorded" meta="By Jane · 2 Jan 2025 14:30" entityRef="c-123" />
          <AuditEventRow eventType="Loan approved" meta="By Treasurer · 1 Jan 2025" />
        </div>
        <StatusSummaryStrip items={[{ statusId: 'recorded', label: 'Recorded', count: 10 }, { statusId: 'reversed', label: 'Reversed', count: 1 }]} />
      </section>

      <section style={{ marginBottom: tokens.space[8] }}>
        <h2 style={{ fontSize: tokens.font.size.lg, fontWeight: tokens.font.weight.semibold, marginBottom: tokens.space[4] }}>
          AdminConsoleLayout
        </h2>
        <AdminConsoleLayout maxWidth={480}>
          <PageHeader title="Support home" subtitle="Wider max-width, responsive" />
          <p style={{ fontSize: tokens.font.size.sm }}>Admin/support screens use this layout.</p>
        </AdminConsoleLayout>
      </section>
    </div>
  );
}
