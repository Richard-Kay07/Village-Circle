'use client';

import React from 'react';
import Link from 'next/link';
import { tokens } from '@/lib/design-system/tokens';

export default function TokenShowcasePage() {
  const moduleIds = ['vcSave', 'vcHub', 'vcGrow', 'vcPay', 'vcLearn'] as const;
  const statusIds = ['recorded', 'pending', 'approved', 'overdue', 'reversed', 'failed', 'delivered'] as const;

  return (
    <div className="layout-container" style={{ paddingTop: tokens.space[6], paddingBottom: tokens.space[8] }}>
      <div style={{ display: 'flex', gap: tokens.space[4], marginBottom: tokens.space[4], flexWrap: 'wrap' }}>
        <Link href="/" style={{ color: tokens.color.primary, fontSize: tokens.font.size.base }}>← Back</Link>
        <Link href="/design-system/logo" style={{ color: tokens.color.primary, fontSize: tokens.font.size.base }}>Logo</Link>
        <Link href="/design-system/badges" style={{ color: tokens.color.primary, fontSize: tokens.font.size.base }}>Badges</Link>
      </div>
      <h1 style={{ fontSize: tokens.font.size['2xl'], fontWeight: tokens.font.weight.bold, marginBottom: tokens.space[2] }}>
        Design tokens
      </h1>
      <p style={{ color: tokens.semantic.text.secondary, marginBottom: tokens.space[6] }}>
        VillageCircle360 token preview. Use semantic and module tokens in UI; avoid hardcoded colours.
      </p>

      <section style={{ marginBottom: tokens.space[8] }}>
        <h2 style={{ fontSize: tokens.font.size.lg, fontWeight: tokens.font.weight.semibold, marginBottom: tokens.space[4] }}>
          Module cards (accent restraint)
        </h2>
        <div style={{ display: 'grid', gap: tokens.space[4], gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {moduleIds.map((id) => {
            const m = tokens.module[id];
            const label = id.replace('vc', 'VC ');
            return (
              <div
                key={id}
                style={{
                  background: tokens.semantic.surface.default,
                  borderLeft: `4px solid ${m.default}`,
                  borderRadius: tokens.radius.lg,
                  padding: tokens.space[4],
                  boxShadow: tokens.shadow.sm,
                  border: `1px solid ${tokens.semantic.border.default}`,
                }}
              >
                <span style={{ color: m.default, fontWeight: tokens.font.weight.semibold, fontSize: tokens.font.size.base }}>
                  {label}
                </span>
                <p style={{ color: tokens.semantic.text.muted, marginTop: tokens.space[2], fontSize: tokens.font.size.sm }}>
                  Module accent
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section style={{ marginBottom: tokens.space[8] }}>
        <h2 style={{ fontSize: tokens.font.size.lg, fontWeight: tokens.font.weight.semibold, marginBottom: tokens.space[4] }}>
          Status badges (pair with icons/labels)
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.space[2] }}>
          {statusIds.map((id) => {
            const s = tokens.status[id];
            return (
              <span
                key={id}
                style={{
                  backgroundColor: s.bg,
                  color: s.text,
                  border: `1px solid ${s.border}`,
                  padding: `${tokens.space[1]} ${tokens.space[2]}`,
                  borderRadius: tokens.radius.sm,
                  fontSize: tokens.font.size.xs,
                  textTransform: 'capitalize',
                }}
              >
                {id}
              </span>
            );
          })}
        </div>
      </section>

      <section style={{ marginBottom: tokens.space[8] }}>
        <h2 style={{ fontSize: tokens.font.size.lg, fontWeight: tokens.font.weight.semibold, marginBottom: tokens.space[4] }}>
          Confirm dialog (primary / danger)
        </h2>
        <div style={{ display: 'flex', gap: tokens.space[4], flexWrap: 'wrap' }}>
          <button
            type="button"
            style={{
              backgroundColor: tokens.semantic.action.primary.bg,
              color: tokens.semantic.action.primary.text,
              border: `1px solid ${tokens.semantic.action.primary.border}`,
              padding: `${tokens.space[2]} ${tokens.space[4]}`,
              borderRadius: tokens.radius.md,
              minHeight: tokens.touchTargetMin,
              fontSize: tokens.font.size.base,
              fontWeight: tokens.font.weight.medium,
            }}
          >
            Confirm
          </button>
          <button
            type="button"
            style={{
              backgroundColor: tokens.semantic.action.danger.bg,
              color: tokens.semantic.action.danger.text,
              border: `1px solid ${tokens.semantic.action.danger.border}`,
              padding: `${tokens.space[2]} ${tokens.space[4]}`,
              borderRadius: tokens.radius.md,
              minHeight: tokens.touchTargetMin,
              fontSize: tokens.font.size.base,
              fontWeight: tokens.font.weight.medium,
            }}
          >
            Delete
          </button>
        </div>
      </section>

      <section style={{ marginBottom: tokens.space[8] }}>
        <h2 style={{ fontSize: tokens.font.size.lg, fontWeight: tokens.font.weight.semibold, marginBottom: tokens.space[4] }}>
          Warning / error / success banners
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.space[4] }}>
          <div
            style={{
              backgroundColor: tokens.semantic.warning.bg,
              color: tokens.semantic.warning.text,
              border: `1px solid ${tokens.semantic.warning.border}`,
              padding: tokens.space[4],
              borderRadius: tokens.radius.md,
            }}
          >
            Warning: Please complete your profile before applying.
          </div>
          <div
            style={{
              backgroundColor: tokens.semantic.error.bg,
              color: tokens.semantic.error.text,
              border: `1px solid ${tokens.semantic.error.border}`,
              padding: tokens.space[4],
              borderRadius: tokens.radius.md,
            }}
          >
            Error: Could not load data. Try again.
          </div>
          <div
            style={{
              backgroundColor: tokens.semantic.success.bg,
              color: tokens.semantic.success.text,
              border: `1px solid ${tokens.semantic.success.border}`,
              padding: tokens.space[4],
              borderRadius: tokens.radius.md,
            }}
          >
            Success: Your changes have been saved.
          </div>
        </div>
      </section>

      <p style={{ fontSize: tokens.font.size.sm, color: tokens.semantic.text.muted }}>
        See docs/TOKENS.md for usage guidance. Module accents should be restrained; status must be paired with icons and labels.
      </p>
    </div>
  );
}
