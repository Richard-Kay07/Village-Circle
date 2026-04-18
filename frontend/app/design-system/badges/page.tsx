'use client';

import React from 'react';
import Link from 'next/link';
import { tokens } from '@/lib/design-system/tokens';
import {
  ModuleBadge,
  StatusBadge,
  ChannelBadge,
  TransactionModeBadge,
} from '@/components/ui';
import { STATUS_IDS, CHANNEL_IDS, TRANSACTION_MODE_IDS } from '@/lib/design-system/badges';
import { MVP_MODULE_IDS, LATER_MODULE_IDS } from '@/lib/brand/architecture';

export default function BadgesPage() {
  return (
    <div className="layout-container" style={{ paddingTop: tokens.space[6], paddingBottom: tokens.space[8] }}>
      <div style={{ display: 'flex', gap: tokens.space[4], marginBottom: tokens.space[4], flexWrap: 'wrap' }}>
        <Link href="/" style={{ color: tokens.color.primary, fontSize: tokens.font.size.base }}>← Back</Link>
        <Link href="/design-system/tokens" style={{ color: tokens.color.primary, fontSize: tokens.font.size.base }}>Tokens</Link>
        <Link href="/design-system/logo" style={{ color: tokens.color.primary, fontSize: tokens.font.size.base }}>Logo</Link>
      </div>
      <h1 style={{ fontSize: tokens.font.size['2xl'], fontWeight: tokens.font.weight.bold, marginBottom: tokens.space[2] }}>
        Badges and module identity
      </h1>
      <p style={{ color: tokens.semantic.text.secondary, marginBottom: tokens.space[6] }}>
        ModuleBadge, StatusBadge, ChannelBadge, TransactionModeBadge. See docs/ICON_BADGE_MODULE_IDENTITY.md.
      </p>

      <section style={{ marginBottom: tokens.space[8] }}>
        <h2 style={{ fontSize: tokens.font.size.lg, fontWeight: tokens.font.weight.semibold, marginBottom: tokens.space[4] }}>
          ModuleBadge (VC Save / VC Hub / VC Grow / Coming soon)
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.space[2], marginBottom: tokens.space[4] }}>
          {MVP_MODULE_IDS.map((id) => (
            <ModuleBadge key={id} moduleId={id} />
          ))}
          {LATER_MODULE_IDS.map((id) => (
            <ModuleBadge key={id} moduleId={id} />
          ))}
        </div>
        <p style={{ fontSize: tokens.font.size.sm, color: tokens.semantic.text.muted }}>Short labels:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.space[2] }}>
          {MVP_MODULE_IDS.map((id) => (
            <ModuleBadge key={id} moduleId={id} short />
          ))}
          <ModuleBadge moduleId="pay" short variant="comingSoon" />
          <ModuleBadge moduleId="learn" short variant="comingSoon" />
        </div>
      </section>

      <section style={{ marginBottom: tokens.space[8] }}>
        <h2 style={{ fontSize: tokens.font.size.lg, fontWeight: tokens.font.weight.semibold, marginBottom: tokens.space[4] }}>
          StatusBadge
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.space[2] }}>
          {STATUS_IDS.map((id) => (
            <StatusBadge key={id} statusId={id} />
          ))}
        </div>
      </section>

      <section style={{ marginBottom: tokens.space[8] }}>
        <h2 style={{ fontSize: tokens.font.size.lg, fontWeight: tokens.font.weight.semibold, marginBottom: tokens.space[4] }}>
          ChannelBadge
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.space[2] }}>
          {CHANNEL_IDS.map((id) => (
            <ChannelBadge key={id} channelId={id} />
          ))}
          <span style={{ marginLeft: tokens.space[2], fontSize: tokens.font.size.sm, color: tokens.semantic.text.muted }}>Short:</span>
          {CHANNEL_IDS.map((id) => (
            <ChannelBadge key={id} channelId={id} short />
          ))}
        </div>
      </section>

      <section style={{ marginBottom: tokens.space[8] }}>
        <h2 style={{ fontSize: tokens.font.size.lg, fontWeight: tokens.font.weight.semibold, marginBottom: tokens.space[4] }}>
          TransactionModeBadge
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.space[2] }}>
          {TRANSACTION_MODE_IDS.map((id) => (
            <TransactionModeBadge key={id} mode={id} />
          ))}
          <TransactionModeBadge mode="BANK_TRANSFER" short />
        </div>
      </section>

      <section style={{ marginBottom: tokens.space[8] }}>
        <h2 style={{ fontSize: tokens.font.size.lg, fontWeight: tokens.font.weight.semibold, marginBottom: tokens.space[4] }}>
          Example: Dashboard cards
        </h2>
        <div style={{ display: 'grid', gap: tokens.space[4], gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {MVP_MODULE_IDS.map((id) => (
            <div
              key={id}
              style={{
                padding: tokens.space[4],
                border: `1px solid ${tokens.semantic.border.default}`,
                borderRadius: tokens.radius.lg,
                backgroundColor: tokens.semantic.surface.default,
              }}
            >
              <ModuleBadge moduleId={id} />
              <p style={{ marginTop: tokens.space[2], fontSize: tokens.font.size.sm, color: tokens.semantic.text.muted }}>
                Summary or CTA
              </p>
            </div>
          ))}
          <div
            style={{
              padding: tokens.space[4],
              border: `1px solid ${tokens.semantic.border.subtle}`,
              borderRadius: tokens.radius.lg,
              backgroundColor: tokens.semantic.surface.muted,
              opacity: 0.9,
            }}
          >
            <ModuleBadge moduleId="pay" />
            <p style={{ marginTop: tokens.space[2], fontSize: tokens.font.size.sm, color: tokens.semantic.text.muted }}>
              Not available in this release.
            </p>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: tokens.space[8] }}>
        <h2 style={{ fontSize: tokens.font.size.lg, fontWeight: tokens.font.weight.semibold, marginBottom: tokens.space[4] }}>
          Example: Loan list row
        </h2>
        <div style={{ border: `1px solid ${tokens.semantic.border.default}`, borderRadius: tokens.radius.md, overflow: 'hidden' }}>
          {[
            { id: '1', member: 'Member A', status: 'approved' as const, mode: 'CASH' as const },
            { id: '2', member: 'Member B', status: 'overdue' as const, mode: 'BANK_TRANSFER' as const },
          ].map((row) => (
            <div
              key={row.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.space[3],
                padding: tokens.space[3],
                borderBottom: `1px solid ${tokens.semantic.border.default}`,
              }}
            >
              <span style={{ fontWeight: tokens.font.weight.medium }}>{row.member}</span>
              <StatusBadge statusId={row.status} />
              <TransactionModeBadge mode={row.mode} short />
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: tokens.space[8] }}>
        <h2 style={{ fontSize: tokens.font.size.lg, fontWeight: tokens.font.weight.semibold, marginBottom: tokens.space[4] }}>
          Example: Contribution row
        </h2>
        <div style={{ border: `1px solid ${tokens.semantic.border.default}`, borderRadius: tokens.radius.md, overflow: 'hidden' }}>
          {[
            { id: '1', member: 'Member A', status: 'recorded' as const, mode: 'CASH' as const },
            { id: '2', member: 'Member B', status: 'reversed' as const, mode: 'BANK_TRANSFER' as const },
          ].map((row) => (
            <div
              key={row.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.space[3],
                padding: tokens.space[3],
                borderBottom: `1px solid ${tokens.semantic.border.default}`,
              }}
            >
              <span style={{ fontWeight: tokens.font.weight.medium }}>{row.member}</span>
              <StatusBadge statusId={row.status} />
              <TransactionModeBadge mode={row.mode} />
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: tokens.space[8] }}>
        <h2 style={{ fontSize: tokens.font.size.lg, fontWeight: tokens.font.weight.semibold, marginBottom: tokens.space[4] }}>
          Example: Notifications list
        </h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, border: `1px solid ${tokens.semantic.border.default}`, borderRadius: tokens.radius.md, overflow: 'hidden' }}>
          {[
            { id: '1', channel: 'in_app' as const, title: 'Loan due reminder', status: 'delivered' as const },
            { id: '2', channel: 'sms' as const, title: 'Contribution recorded', status: 'delivered' as const },
          ].map((n) => (
            <li
              key={n.id}
              style={{
                padding: tokens.space[3],
                borderBottom: `1px solid ${tokens.semantic.border.default}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.space[2], marginBottom: tokens.space[1] }}>
                <ChannelBadge channelId={n.channel} short />
                <StatusBadge statusId={n.status} short />
              </div>
              <div style={{ fontWeight: tokens.font.weight.medium }}>{n.title}</div>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginBottom: tokens.space[8] }}>
        <h2 style={{ fontSize: tokens.font.size.lg, fontWeight: tokens.font.weight.semibold, marginBottom: tokens.space[4] }}>
          Example: Admin trace / timeline
        </h2>
        <div style={{ borderLeft: `3px solid ${tokens.semantic.border.default}`, paddingLeft: tokens.space[4] }}>
          {[
            { event: 'Contribution recorded', status: 'recorded' as const, channel: 'in_app' as const },
            { event: 'SMS sent', status: 'delivered' as const, channel: 'sms' as const },
          ].map((e, i) => (
            <div key={i} style={{ marginBottom: tokens.space[3] }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.space[2], flexWrap: 'wrap' }}>
                <StatusBadge statusId={e.status} />
                <ChannelBadge channelId={e.channel} short />
              </div>
              <div style={{ fontSize: tokens.font.size.sm, color: tokens.semantic.text.secondary }}>{e.event}</div>
            </div>
          ))}
        </div>
      </section>

      <p style={{ fontSize: tokens.font.size.sm, color: tokens.semantic.text.muted }}>
        Coming soon badges use muted styling; do not use accent or primary for VC Pay / VC Learn until released.
      </p>
    </div>
  );
}
