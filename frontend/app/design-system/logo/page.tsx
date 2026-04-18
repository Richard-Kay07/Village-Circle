'use client';

import React from 'react';
import Link from 'next/link';
import { tokens } from '@/lib/design-system/tokens';
import { BRAND_ASSET_MANIFEST } from '@/lib/brand/logo-manifest';

function LogoPlaceholder({ label, minH, minW }: { label: string; minH?: number; minW?: number }) {
  return (
    <div
      style={{
        minHeight: minH ?? 48,
        minWidth: minW ?? 120,
        background: tokens.semantic.surface.muted,
        border: `2px dashed ${tokens.semantic.border.default}`,
        borderRadius: tokens.radius.md,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: tokens.semantic.text.muted,
        fontSize: tokens.font.size.xs,
        textAlign: 'center',
        padding: tokens.space[2],
      }}
    >
      {label}
    </div>
  );
}

function AssetRow({ entry }: { entry: (typeof BRAND_ASSET_MANIFEST)[0] }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: tokens.space[4],
        padding: tokens.space[3],
        borderBottom: `1px solid ${tokens.semantic.border.default}`,
      }}
    >
      <div style={{ flexShrink: 0 }}>
        <LogoPlaceholder
          label={entry.assetType}
          minH={Math.min(48, entry.recommendedMinHeightPx * 1.5)}
          minW={entry.recommendedMinWidthPx ? Math.min(120, entry.recommendedMinWidthPx / 2) : 80}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: tokens.font.weight.medium }}>{entry.id}</div>
        <div style={{ fontSize: tokens.font.size.sm, color: tokens.semantic.text.muted }}>
          {entry.assetType} · {entry.themeSupport} · min h {entry.recommendedMinHeightPx}px
          {entry.tmIncluded ? ' · TM included' : ''}
        </div>
        <div style={{ fontSize: tokens.font.size.xs, color: tokens.semantic.text.muted, marginTop: tokens.space[1] }}>
          {entry.filePath}
        </div>
      </div>
    </div>
  );
}

export default function LogoUsagePage() {
  return (
    <div className="layout-container" style={{ paddingTop: tokens.space[6], paddingBottom: tokens.space[8] }}>
      <Link
        href="/design-system/tokens"
        style={{
          display: 'inline-block',
          marginBottom: tokens.space[4],
          color: tokens.color.primary,
          fontSize: tokens.font.size.base,
        }}
      >
        ← Design system
      </Link>
      <h1 style={{ fontSize: tokens.font.size['2xl'], fontWeight: tokens.font.weight.bold, marginBottom: tokens.space[2] }}>
        Logo usage
      </h1>
      <p style={{ color: tokens.semantic.text.secondary, marginBottom: tokens.space[6] }}>
        Master logo integration and example surfaces. All usage must reference the brand asset manifest. See docs/LOGO_USAGE.md.
      </p>

      <section style={{ marginBottom: tokens.space[8] }}>
        <h2 style={{ fontSize: tokens.font.size.lg, fontWeight: tokens.font.weight.semibold, marginBottom: tokens.space[4] }}>
          Asset manifest
        </h2>
        <div
          style={{
            border: `1px solid ${tokens.semantic.border.default}`,
            borderRadius: tokens.radius.lg,
            overflow: 'hidden',
          }}
        >
          {BRAND_ASSET_MANIFEST.map((entry) => (
            <AssetRow key={entry.id} entry={entry} />
          ))}
        </div>
      </section>

      <section style={{ marginBottom: tokens.space[8] }}>
        <h2 style={{ fontSize: tokens.font.size.lg, fontWeight: tokens.font.weight.semibold, marginBottom: tokens.space[4] }}>
          Example surfaces
        </h2>

        <h3 style={{ fontSize: tokens.font.size.base, marginBottom: tokens.space[2] }}>Product top nav (lockup)</h3>
        <div
          style={{
            padding: `${tokens.space[3]} ${tokens.space[4]}`,
            background: tokens.semantic.surface.default,
            border: `1px solid ${tokens.semantic.border.default}`,
            borderRadius: tokens.radius.md,
            marginBottom: tokens.space[6],
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.space[4] }}>
            <LogoPlaceholder label="Lockup (light)" minH={32} minW={180} />
            <span style={{ color: tokens.semantic.text.muted, fontSize: tokens.font.size.sm }}>Nav items…</span>
          </div>
        </div>

        <h3 style={{ fontSize: tokens.font.size.base, marginBottom: tokens.space[2] }}>Mobile header (symbol-only)</h3>
        <div
          style={{
            padding: tokens.space[3],
            background: tokens.semantic.surface.default,
            border: `1px solid ${tokens.semantic.border.default}`,
            borderRadius: tokens.radius.md,
            marginBottom: tokens.space[6],
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.space[3] }}>
            <LogoPlaceholder label="Symbol" minH={24} minW={24} />
            <span style={{ flex: 1, fontWeight: tokens.font.weight.medium }}>Screen title</span>
          </div>
        </div>

        <h3 style={{ fontSize: tokens.font.size.base, marginBottom: tokens.space[2] }}>Login screen</h3>
        <div
          style={{
            padding: tokens.space[8],
            background: tokens.semantic.surface.muted,
            border: `1px solid ${tokens.semantic.border.default}`,
            borderRadius: tokens.radius.lg,
            marginBottom: tokens.space[6],
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'inline-block', marginBottom: tokens.space[6] }}>
            <LogoPlaceholder label="Lockup centered" minH={40} minW={220} />
          </div>
          <div style={{ height: 40, background: tokens.semantic.surface.default, borderRadius: tokens.radius.sm, maxWidth: 320, margin: '0 auto' }} />
        </div>

        <h3 style={{ fontSize: tokens.font.size.base, marginBottom: tokens.space[2] }}>Module card (master + labels)</h3>
        <div
          style={{
            padding: tokens.space[4],
            background: tokens.semantic.surface.default,
            border: `1px solid ${tokens.semantic.border.default}`,
            borderRadius: tokens.radius.lg,
            marginBottom: tokens.space[6],
          }}
        >
          <LogoPlaceholder label="VillageCircle360" minH={24} minW={140} />
          <div style={{ display: 'flex', gap: tokens.space[2], marginTop: tokens.space[3], flexWrap: 'wrap' }}>
            <span style={{ fontSize: tokens.font.size.sm, color: tokens.module.vcSave.default }}>VC Save</span>
            <span style={{ fontSize: tokens.font.size.sm, color: tokens.module.vcHub.default }}>VC Hub</span>
            <span style={{ fontSize: tokens.font.size.sm, color: tokens.module.vcGrow.default }}>VC Grow</span>
          </div>
        </div>

        <h3 style={{ fontSize: tokens.font.size.base, marginBottom: tokens.space[2] }}>Legal page footer</h3>
        <div
          style={{
            padding: tokens.space[4],
            background: tokens.semantic.surface.default,
            borderTop: `1px solid ${tokens.semantic.border.default}`,
          }}
        >
          <LogoPlaceholder label="Lockup 24px min" minH={24} minW={120} />
          <p style={{ fontSize: tokens.font.size.xs, color: tokens.semantic.text.muted, marginTop: tokens.space[2] }}>
            © VillageCircle360. Terms · Privacy
          </p>
        </div>

        <h3 style={{ fontSize: tokens.font.size.base, marginBottom: tokens.space[2], marginTop: tokens.space[6] }}>
          Splash / loading state
        </h3>
        <div
          style={{
            padding: tokens.space[8],
            background: tokens.semantic.background.default,
            border: `1px solid ${tokens.semantic.border.default}`,
            borderRadius: tokens.radius.lg,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
            <LogoPlaceholder label="Lockup or symbol" minH={40} minW={180} />
          </div>
        </div>
      </section>

      <section style={{ marginBottom: tokens.space[8] }}>
        <h2 style={{ fontSize: tokens.font.size.lg, fontWeight: tokens.font.weight.semibold, marginBottom: tokens.space[4] }}>
          Platform branding (favicon, app icon, splash)
        </h2>
        <p style={{ color: tokens.semantic.text.secondary, marginBottom: tokens.space[4], fontSize: tokens.font.size.sm }}>
          Symbol-only for favicon and app icon; no TM, no wordmark. See docs/APP_ICON_FAVICON_BRANDING.md and docs/SPLASH_LOADING_BRANDING.md.
        </p>

        <h3 style={{ fontSize: tokens.font.size.base, marginBottom: tokens.space[2] }}>Favicon and app icon (symbol-only)</h3>
        <div style={{ display: 'flex', gap: tokens.space[4], flexWrap: 'wrap', marginBottom: tokens.space[6] }}>
          <LogoPlaceholder label="Favicon 32" minH={32} minW={32} />
          <LogoPlaceholder label="App icon 192" minH={48} minW={48} />
          <LogoPlaceholder label="App icon 512" minH={64} minW={64} />
        </div>

        <h3 style={{ fontSize: tokens.font.size.base, marginBottom: tokens.space[2] }}>Splash / loading on light surface</h3>
        <div
          style={{
            padding: tokens.space[8],
            background: tokens.semantic.surface.default,
            border: `1px solid ${tokens.semantic.border.default}`,
            borderRadius: tokens.radius.lg,
            marginBottom: tokens.space[6],
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 100 }}>
            <LogoPlaceholder label="Symbol or lockup" minH={40} minW={180} />
          </div>
        </div>

        <h3 style={{ fontSize: tokens.font.size.base, marginBottom: tokens.space[2] }}>Splash / loading on dark surface</h3>
        <div
          style={{
            padding: tokens.space[8],
            background: '#1A1C1F',
            border: `1px solid ${tokens.semantic.border.default}`,
            borderRadius: tokens.radius.lg,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 100 }}>
            <LogoPlaceholder label="Symbol dark" minH={40} minW={180} />
          </div>
        </div>
      </section>

      <p style={{ fontSize: tokens.font.size.sm, color: tokens.semantic.text.muted }}>
        Add approved assets to public/brand/logo/. Do not stretch, alter colours or use outside manifest entry points.
      </p>
    </div>
  );
}
