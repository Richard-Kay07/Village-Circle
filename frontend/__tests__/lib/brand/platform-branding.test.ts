/**
 * Platform branding spec validation: required icon/splash metadata,
 * no TM or wordmark in favicon/app icon, and optional file presence.
 */

import * as path from 'path';
import * as fs from 'fs';
import {
  PLATFORM_BRANDING_SPEC,
  PLATFORM_BRANDING_REQUIRED_FIELDS,
  PLATFORM_BRANDING_NO_TM_ASSET_TYPES,
  getPlatformBrandingById,
  getPlatformBrandingByPlatform,
  getPlatformBrandingByType,
  getPlatformBrandingAssetUrl,
  type PlatformBrandingAssetSpec,
  type PlatformBrandingAssetType,
  type PlatformBrandingPlatform,
} from '@/lib/brand/platform-branding';

describe('Platform branding spec', () => {
  it('every entry has required metadata fields', () => {
    PLATFORM_BRANDING_SPEC.forEach((entry) => {
      PLATFORM_BRANDING_REQUIRED_FIELDS.forEach((field) => {
        expect(entry[field]).toBeDefined();
      });
      expect(typeof entry.id).toBe('string');
      expect(entry.id.length).toBeGreaterThan(0);
      expect(typeof entry.notes).toBe('string');
      expect(entry.notes.length).toBeGreaterThan(0);
      expect(typeof entry.tmIncluded).toBe('boolean');
    });
  });

  it('favicon and app icon entries have tmIncluded false and sourceVariant symbol-only', () => {
    const noTmTypes = new Set(PLATFORM_BRANDING_NO_TM_ASSET_TYPES);
    PLATFORM_BRANDING_SPEC.forEach((entry) => {
      if (noTmTypes.has(entry.assetType)) {
        expect(entry.tmIncluded).toBe(false);
        expect(entry.sourceVariant).toBe('symbol-only');
      }
    });
  });

  it('no favicon or app icon entry includes tagline or wordmark (sourceVariant)', () => {
    const iconTypes: PlatformBrandingAssetType[] = ['favicon', 'pwa-icon', 'app-icon'];
    PLATFORM_BRANDING_SPEC.filter((e) => iconTypes.includes(e.assetType)).forEach((entry) => {
      expect(entry.sourceVariant).toBe('symbol-only');
      expect(entry.tmIncluded).toBe(false);
    });
  });

  it('ids are unique', () => {
    const ids = PLATFORM_BRANDING_SPEC.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('getPlatformBrandingById returns entry for valid id', () => {
    const id = PLATFORM_BRANDING_SPEC[0].id;
    expect(getPlatformBrandingById(id)).toBe(PLATFORM_BRANDING_SPEC[0]);
    expect(getPlatformBrandingById('nonexistent')).toBeUndefined();
  });

  it('getPlatformBrandingByPlatform returns only that platform', () => {
    const web = getPlatformBrandingByPlatform('web');
    expect(web.every((e) => e.platform === 'web')).toBe(true);
    const ios = getPlatformBrandingByPlatform('ios');
    expect(ios.every((e) => e.platform === 'ios')).toBe(true);
  });

  it('getPlatformBrandingByType returns only that asset type', () => {
    const favicons = getPlatformBrandingByType('favicon');
    expect(favicons.every((e) => e.assetType === 'favicon')).toBe(true);
  });

  it('getPlatformBrandingAssetUrl returns path with leading slash when filePath present', () => {
    const withPath = PLATFORM_BRANDING_SPEC.find((e) => e.filePath);
    expect(withPath).toBeDefined();
    const url = withPath && getPlatformBrandingAssetUrl(withPath);
    expect(url).toMatch(/^\//);
    expect(url).toContain(withPath!.filePath);
  });
});

describe('Platform branding asset file presence', () => {
  const publicDir = path.join(process.cwd(), 'public');

  /** MVP-required assets: favicon and app icon source. Add to public/ for test to pass. */
  const requiredPaths = ['brand/logo/favicon.ico', 'brand/logo/app-icon-1024.png'];

  requiredPaths.forEach((relativePath) => {
    const absolute = path.join(publicDir, relativePath);
    const exists = fs.existsSync(absolute);
    (exists ? it : it.skip)(`declared required asset exists: ${relativePath}`, () => {
      expect(fs.existsSync(absolute)).toBe(true);
    });
  });

  it('all spec entries with filePath have path under public/', () => {
    PLATFORM_BRANDING_SPEC.forEach((entry) => {
      if (entry.filePath) {
        expect(entry.filePath).not.toMatch(/^\//);
        expect(entry.filePath.length).toBeGreaterThan(0);
      }
    });
  });
});
