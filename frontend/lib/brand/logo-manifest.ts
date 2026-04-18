/**
 * VillageCircle360 brand asset manifest – machine-readable source of truth for logo and related assets.
 * All logo usage in the app must reference this manifest (no direct paths to random files).
 *
 * Approved assets should be placed in public/brand/ as per paths below. If only one variant is supplied,
 * document the gap in usage notes and create usage note for light/dark.
 *
 * @see docs/LOGO_USAGE.md
 */

export type BrandAssetType = 'lockup' | 'symbol' | 'wordmark' | 'tagline-lockup';

export type ThemeSupport = 'light' | 'dark';

export interface BrandAssetEntry {
  id: string;
  assetType: BrandAssetType;
  themeSupport: ThemeSupport;
  /** Path relative to public/ (e.g. brand/logo/villagecircle360-lockup-light.svg) */
  filePath: string;
  /** Recommended minimum height in px (e.g. for lockup height) */
  recommendedMinHeightPx: number;
  /** Optional minimum width for lockups */
  recommendedMinWidthPx?: number;
  usageNotes: string;
  /** True if the asset file includes TM in the artwork */
  tmIncluded: boolean;
}

/** Approved brand asset manifest. Add or update entries when new assets are approved. */
export const BRAND_ASSET_MANIFEST: BrandAssetEntry[] = [
  {
    id: 'lockup-light',
    assetType: 'lockup',
    themeSupport: 'light',
    filePath: 'brand/logo/villagecircle360-lockup-light.svg',
    recommendedMinHeightPx: 32,
    recommendedMinWidthPx: 180,
    usageNotes: 'Primary lockup (symbol + wordmark) for light backgrounds. Use in nav, auth, footer on light surfaces.',
    tmIncluded: false,
  },
  {
    id: 'lockup-dark',
    assetType: 'lockup',
    themeSupport: 'dark',
    filePath: 'brand/logo/villagecircle360-lockup-dark.svg',
    recommendedMinHeightPx: 32,
    recommendedMinWidthPx: 180,
    usageNotes: 'Lockup for dark backgrounds. Use in nav, splash, auth when background is dark. If asset not yet supplied, use lockup-light on light bg only and document gap.',
    tmIncluded: false,
  },
  {
    id: 'symbol-light',
    assetType: 'symbol',
    themeSupport: 'light',
    filePath: 'brand/logo/villagecircle360-symbol-light.svg',
    recommendedMinHeightPx: 24,
    usageNotes: 'Symbol-only mark for light backgrounds. App icon, favicon source, compact nav. No TM in symbol-only.',
    tmIncluded: false,
  },
  {
    id: 'symbol-dark',
    assetType: 'symbol',
    themeSupport: 'dark',
    filePath: 'brand/logo/villagecircle360-symbol-dark.svg',
    recommendedMinHeightPx: 24,
    usageNotes: 'Symbol-only for dark backgrounds. Splash, dark nav. If not supplied, use symbol-light with acceptable contrast check.',
    tmIncluded: false,
  },
  {
    id: 'tagline-lockup-light',
    assetType: 'tagline-lockup',
    themeSupport: 'light',
    filePath: 'brand/logo/villagecircle360-tagline-lockup-light.svg',
    recommendedMinHeightPx: 40,
    recommendedMinWidthPx: 220,
    usageNotes: 'Marketing only: lockup with tagline. Do not use in dense product UI. Prefer lockup without tagline in nav, forms, operational screens.',
    tmIncluded: false,
  },
  {
    id: 'favicon',
    assetType: 'symbol',
    themeSupport: 'light',
    filePath: 'brand/logo/favicon.ico',
    recommendedMinHeightPx: 32,
    usageNotes: 'Favicon export from symbol-only. No TM. Prefer 32x32 or multi-size ICO. Monochrome or two-tone acceptable for small sizes.',
    tmIncluded: false,
  },
  {
    id: 'app-icon-source',
    assetType: 'symbol',
    themeSupport: 'light',
    filePath: 'brand/logo/app-icon-1024.png',
    recommendedMinHeightPx: 1024,
    usageNotes: 'App icon source 1024x1024. Symbol-only, no TM. Export to required sizes from this source. Safe area: keep key mark within ~80% center.',
    tmIncluded: false,
  },
];

/** Public base path for static assets (Next.js public/) */
export const BRAND_ASSET_BASE = '';

/** Get public URL for an asset (Next.js: paths from root become /brand/...) */
export function getBrandAssetUrl(entry: BrandAssetEntry): string {
  return `/${entry.filePath}`;
}

/** Get asset by id. Use this as the single entry point for logo in components. */
export function getBrandAssetById(id: string): BrandAssetEntry | undefined {
  return BRAND_ASSET_MANIFEST.find((e) => e.id === id);
}

/** Get primary lockup for theme (light preferred if both exist). */
export function getLockupForTheme(theme: ThemeSupport): BrandAssetEntry | undefined {
  return BRAND_ASSET_MANIFEST.find((e) => e.assetType === 'lockup' && e.themeSupport === theme);
}

/** Get symbol-only asset for theme. Use for favicon, app icon, compact nav. */
export function getSymbolForTheme(theme: ThemeSupport): BrandAssetEntry | undefined {
  return BRAND_ASSET_MANIFEST.find((e) => e.assetType === 'symbol' && e.themeSupport === theme && e.id !== 'favicon' && e.id !== 'app-icon-source');
}
