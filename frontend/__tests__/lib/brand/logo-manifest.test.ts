/**
 * Brand asset manifest validation: required fields, paths, and entry-point usage.
 */

import {
  BRAND_ASSET_MANIFEST,
  getBrandAssetById,
  getLockupForTheme,
  getSymbolForTheme,
  getBrandAssetUrl,
  type BrandAssetEntry,
  type BrandAssetType,
  type ThemeSupport,
} from '@/lib/brand/logo-manifest';

const REQUIRED_FIELDS: (keyof BrandAssetEntry)[] = [
  'id',
  'assetType',
  'themeSupport',
  'filePath',
  'recommendedMinHeightPx',
  'usageNotes',
  'tmIncluded',
];

const VALID_ASSET_TYPES: BrandAssetType[] = ['lockup', 'symbol', 'wordmark', 'tagline-lockup'];
const VALID_THEMES: ThemeSupport[] = ['light', 'dark'];

describe('Brand asset manifest', () => {
  it('every entry has required metadata fields', () => {
    BRAND_ASSET_MANIFEST.forEach((entry, i) => {
      REQUIRED_FIELDS.forEach((field) => {
        expect(entry[field]).toBeDefined();
      });
      expect(typeof entry.id).toBe('string');
      expect(entry.id.length).toBeGreaterThan(0);
      expect(typeof entry.usageNotes).toBe('string');
      expect(entry.usageNotes.length).toBeGreaterThan(0);
      expect(typeof entry.tmIncluded).toBe('boolean');
      expect(typeof entry.recommendedMinHeightPx).toBe('number');
      expect(entry.recommendedMinHeightPx).toBeGreaterThan(0);
    });
  });

  it('every entry has valid assetType and themeSupport', () => {
    BRAND_ASSET_MANIFEST.forEach((entry) => {
      expect(VALID_ASSET_TYPES).toContain(entry.assetType);
      expect(VALID_THEMES).toContain(entry.themeSupport);
    });
  });

  it('file paths are under brand/ and do not start with slash', () => {
    BRAND_ASSET_MANIFEST.forEach((entry) => {
      expect(entry.filePath).toMatch(/^brand\//);
      expect(entry.filePath).not.toMatch(/^\//);
    });
  });

  it('ids are unique', () => {
    const ids = BRAND_ASSET_MANIFEST.map((e) => e.id);
    const set = new Set(ids);
    expect(set.size).toBe(ids.length);
  });

  it('getBrandAssetUrl returns path with leading slash', () => {
    const entry = BRAND_ASSET_MANIFEST[0];
    const url = getBrandAssetUrl(entry);
    expect(url).toMatch(/^\//);
    expect(url).toContain(entry.filePath);
  });

  it('getBrandAssetById returns entry for valid id', () => {
    const id = BRAND_ASSET_MANIFEST[0].id;
    expect(getBrandAssetById(id)).toBe(BRAND_ASSET_MANIFEST[0]);
    expect(getBrandAssetById('nonexistent')).toBeUndefined();
  });

  it('getLockupForTheme returns lockup for light and dark', () => {
    const light = getLockupForTheme('light');
    const dark = getLockupForTheme('dark');
    expect(light).toBeDefined();
    expect(light?.assetType).toBe('lockup');
    expect(light?.themeSupport).toBe('light');
    expect(dark).toBeDefined();
    expect(dark?.assetType).toBe('lockup');
    expect(dark?.themeSupport).toBe('dark');
  });

  it('getSymbolForTheme returns symbol (not favicon or app-icon) for theme', () => {
    const light = getSymbolForTheme('light');
    const dark = getSymbolForTheme('dark');
    expect(light).toBeDefined();
    expect(light?.assetType).toBe('symbol');
    expect(light?.id).not.toBe('favicon');
    expect(light?.id).not.toBe('app-icon-source');
    expect(dark).toBeDefined();
    expect(dark?.assetType).toBe('symbol');
  });

  it('at least one lockup and one symbol exist for light theme', () => {
    const lockups = BRAND_ASSET_MANIFEST.filter((e) => e.assetType === 'lockup' && e.themeSupport === 'light');
    const symbols = BRAND_ASSET_MANIFEST.filter((e) => e.assetType === 'symbol' && e.themeSupport === 'light');
    expect(lockups.length).toBeGreaterThanOrEqual(1);
    expect(symbols.length).toBeGreaterThanOrEqual(1);
  });

  it('file paths are unique', () => {
    const paths = BRAND_ASSET_MANIFEST.map((e) => e.filePath);
    const set = new Set(paths);
    expect(set.size).toBe(paths.length);
  });
});
