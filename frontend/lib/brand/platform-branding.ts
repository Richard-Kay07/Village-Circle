/**
 * VillageCircle360 platform branding asset spec – machine-readable config for
 * favicon, PWA icons, app icons, splash/loading assets, and monochrome fallbacks.
 * Use the approved master logo as source-of-truth; do not redraw or distort.
 *
 * @see docs/APP_ICON_FAVICON_BRANDING.md
 * @see docs/SPLASH_LOADING_BRANDING.md
 * @see docs/LOGO_USAGE.md
 */

export type PlatformBrandingPlatform = 'web' | 'pwa' | 'ios' | 'android';

export type PlatformBrandingAssetType =
  | 'favicon'
  | 'pwa-icon'
  | 'app-icon'
  | 'splash'
  | 'loading-mark'
  | 'monochrome';

export type PlatformSourceVariant = 'symbol-only' | 'lockup' | 'wordmark';

export type PlatformThemeSupport = 'dark' | 'light' | 'both';

export type PlatformBackgroundStyle = 'transparent' | 'solid' | 'gradient' | 'token-based';

export interface PlatformBrandingAssetSpec {
  id: string;
  platform: PlatformBrandingPlatform;
  assetType: PlatformBrandingAssetType;
  sourceVariant: PlatformSourceVariant;
  themeSupport: PlatformThemeSupport;
  backgroundStyle: PlatformBackgroundStyle;
  /** Minimum display size in px; legibility threshold */
  minSizePx?: number;
  /** Export sizes for this asset (e.g. [16, 32, 48] for favicon/PWA) */
  exportSizes?: number[];
  /** TM must not appear in favicon or app icon assets */
  tmIncluded: boolean;
  /** Path relative to public/ (optional if derived from logo-manifest) */
  filePath?: string;
  /** Reference to logo-manifest entry id when asset is the same file */
  sourceAssetId?: string;
  /** Maskable (PWA): safe zone for adaptive icons */
  maskable?: boolean;
  notes: string;
}

/** Platform branding asset registry. Single source of truth for icon/splash metadata. */
export const PLATFORM_BRANDING_SPEC: PlatformBrandingAssetSpec[] = [
  // —— Web favicon ——
  {
    id: 'favicon-web',
    platform: 'web',
    assetType: 'favicon',
    sourceVariant: 'symbol-only',
    themeSupport: 'both',
    backgroundStyle: 'transparent',
    minSizePx: 16,
    exportSizes: [16, 32],
    tmIncluded: false,
    filePath: 'brand/logo/favicon.ico',
    sourceAssetId: 'favicon',
    notes: 'Browser tab icon. Symbol only; no wordmark, no TM. Prefer multi-size ICO or 32x32.',
  },
  // —— PWA (web install) ——
  {
    id: 'pwa-icon-192',
    platform: 'pwa',
    assetType: 'pwa-icon',
    sourceVariant: 'symbol-only',
    themeSupport: 'both',
    backgroundStyle: 'solid',
    minSizePx: 192,
    exportSizes: [192],
    tmIncluded: false,
    filePath: 'brand/logo/pwa-icon-192.png',
    maskable: false,
    notes: 'PWA standard icon 192x192. Symbol-only; no TM. Use token-based or dark solid background.',
  },
  {
    id: 'pwa-icon-512',
    platform: 'pwa',
    assetType: 'pwa-icon',
    sourceVariant: 'symbol-only',
    themeSupport: 'both',
    backgroundStyle: 'solid',
    minSizePx: 512,
    exportSizes: [512],
    tmIncluded: false,
    filePath: 'brand/logo/pwa-icon-512.png',
    maskable: false,
    notes: 'PWA standard icon 512x512. Symbol-only; no TM.',
  },
  {
    id: 'pwa-maskable-512',
    platform: 'pwa',
    assetType: 'pwa-icon',
    sourceVariant: 'symbol-only',
    themeSupport: 'both',
    backgroundStyle: 'solid',
    minSizePx: 512,
    exportSizes: [512],
    tmIncluded: false,
    filePath: 'brand/logo/pwa-maskable-512.png',
    maskable: true,
    notes: 'PWA maskable icon. Keep symbol within ~80% safe zone; platform may apply mask.',
  },
  // —— App icon (iOS / Android) ——
  {
    id: 'app-icon-source',
    platform: 'ios',
    assetType: 'app-icon',
    sourceVariant: 'symbol-only',
    themeSupport: 'light',
    backgroundStyle: 'solid',
    minSizePx: 1024,
    exportSizes: [1024],
    tmIncluded: false,
    filePath: 'brand/logo/app-icon-1024.png',
    sourceAssetId: 'app-icon-source',
    notes: 'Master app icon source 1024x1024. Export iOS/Android sizes from this. Symbol within ~80% safe area; no TM.',
  },
  {
    id: 'app-icon-source-android',
    platform: 'android',
    assetType: 'app-icon',
    sourceVariant: 'symbol-only',
    themeSupport: 'both',
    backgroundStyle: 'solid',
    minSizePx: 1024,
    exportSizes: [1024],
    tmIncluded: false,
    filePath: 'brand/logo/app-icon-1024.png',
    sourceAssetId: 'app-icon-source',
    notes: 'Same as app-icon-1024.png. Android adaptive icons: use same source; tooling generates layers.',
  },
  // —— Splash / loading ——
  {
    id: 'splash-logomark',
    platform: 'web',
    assetType: 'splash',
    sourceVariant: 'symbol-only',
    themeSupport: 'both',
    backgroundStyle: 'token-based',
    minSizePx: 32,
    tmIncluded: false,
    notes: 'Web loading/splash: use symbol or lockup centered on token-based background (e.g. semantic.surface or brand dark). No dense text.',
  },
  {
    id: 'splash-logomark-ios',
    platform: 'ios',
    assetType: 'splash',
    sourceVariant: 'symbol-only',
    themeSupport: 'both',
    backgroundStyle: 'token-based',
    minSizePx: 40,
    tmIncluded: false,
    notes: 'iOS splash: symbol or lockup; background from token/brand. Export static image or use native storyboard.',
  },
  {
    id: 'splash-logomark-android',
    platform: 'android',
    assetType: 'splash',
    sourceVariant: 'symbol-only',
    themeSupport: 'both',
    backgroundStyle: 'token-based',
    minSizePx: 40,
    tmIncluded: false,
    notes: 'Android splash: symbol or lockup; token-based background. Use drawable/theme or splash screen API.',
  },
  // —— Loading state (inline) ——
  {
    id: 'loading-mark',
    platform: 'web',
    assetType: 'loading-mark',
    sourceVariant: 'symbol-only',
    themeSupport: 'both',
    backgroundStyle: 'transparent',
    minSizePx: 24,
    tmIncluded: false,
    sourceAssetId: 'symbol-light',
    notes: 'Inline loading (e.g. auth, app startup). Small symbol or lockup; token-based page background. No tagline at small size.',
  },
  // —— Monochrome fallback ——
  {
    id: 'monochrome-light',
    platform: 'web',
    assetType: 'monochrome',
    sourceVariant: 'symbol-only',
    themeSupport: 'light',
    backgroundStyle: 'transparent',
    minSizePx: 16,
    tmIncluded: false,
    filePath: 'brand/logo/symbol-monochrome-light.svg',
    notes: 'Monochrome symbol for light backgrounds (e.g. system contexts that strip colour). Dark mark on light.',
  },
  {
    id: 'monochrome-dark',
    platform: 'web',
    assetType: 'monochrome',
    sourceVariant: 'symbol-only',
    themeSupport: 'dark',
    backgroundStyle: 'transparent',
    minSizePx: 16,
    tmIncluded: false,
    filePath: 'brand/logo/symbol-monochrome-dark.svg',
    notes: 'Monochrome symbol for dark backgrounds. Light mark on dark. Use when OS or browser forces single colour.',
  },
];

/** Required metadata fields for manifest validation (icons/splash). */
export const PLATFORM_BRANDING_REQUIRED_FIELDS: (keyof PlatformBrandingAssetSpec)[] = [
  'id',
  'platform',
  'assetType',
  'sourceVariant',
  'themeSupport',
  'backgroundStyle',
  'tmIncluded',
  'notes',
];

/** Asset types that must never include TM or wordmark/tagline. */
export const PLATFORM_BRANDING_NO_TM_ASSET_TYPES: PlatformBrandingAssetType[] = [
  'favicon',
  'pwa-icon',
  'app-icon',
  'loading-mark',
];

/** Get all spec entries for a platform. */
export function getPlatformBrandingByPlatform(
  platform: PlatformBrandingPlatform
): PlatformBrandingAssetSpec[] {
  return PLATFORM_BRANDING_SPEC.filter((e) => e.platform === platform);
}

/** Get spec entries by asset type (e.g. all favicons, all app-icons). */
export function getPlatformBrandingByType(
  assetType: PlatformBrandingAssetType
): PlatformBrandingAssetSpec[] {
  return PLATFORM_BRANDING_SPEC.filter((e) => e.assetType === assetType);
}

/** Get single entry by id. */
export function getPlatformBrandingById(id: string): PlatformBrandingAssetSpec | undefined {
  return PLATFORM_BRANDING_SPEC.find((e) => e.id === id);
}

/** Public URL for an asset that has filePath. */
export function getPlatformBrandingAssetUrl(spec: PlatformBrandingAssetSpec): string | undefined {
  if (!spec.filePath) return undefined;
  return `/${spec.filePath}`;
}
