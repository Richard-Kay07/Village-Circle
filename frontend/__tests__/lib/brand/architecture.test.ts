import {
  BRAND_MODULE_CONFIG,
  MVP_MODULE_IDS,
  LATER_MODULE_IDS,
  MASTER_BRAND_CONFIG,
  getBrandModuleConfig,
  isModuleAllowedOnSurface,
  type ProductModuleId,
} from '@/lib/brand/architecture';

const ALL_MODULE_IDS: ProductModuleId[] = ['save', 'hub', 'grow', 'pay', 'learn'];

describe('Brand architecture config', () => {
  it('every module config entry includes status', () => {
    ALL_MODULE_IDS.forEach((id) => {
      const config = BRAND_MODULE_CONFIG[id];
      expect(config).toBeDefined();
      expect(config.status).toBeDefined();
      expect(['MVP', 'LATER']).toContain(config.status);
    });
  });

  it('every module config entry includes displayName', () => {
    ALL_MODULE_IDS.forEach((id) => {
      const config = BRAND_MODULE_CONFIG[id];
      expect(config.displayName).toBeDefined();
      expect(typeof config.displayName).toBe('string');
      expect(config.displayName.length).toBeGreaterThan(0);
    });
  });

  it('every module config entry includes legalWordingNotes', () => {
    ALL_MODULE_IDS.forEach((id) => {
      const config = BRAND_MODULE_CONFIG[id];
      expect(config.legalWordingNotes).toBeDefined();
      expect(typeof config.legalWordingNotes).toBe('string');
      expect(config.legalWordingNotes.length).toBeGreaterThan(0);
    });
  });

  it('every module config has required fields: id, shortLabel, purposeSummary, allowedUISurfaces, iconTokenPlaceholder, colorTokenAlias', () => {
    ALL_MODULE_IDS.forEach((id) => {
      const config = BRAND_MODULE_CONFIG[id];
      expect(config.id).toBe(id);
      expect(config.shortLabel).toBeDefined();
      expect(config.purposeSummary).toBeDefined();
      expect(Array.isArray(config.allowedUISurfaces)).toBe(true);
      expect(config.iconTokenPlaceholder).toBeDefined();
      expect(config.colorTokenAlias).toBeDefined();
    });
  });

  it('MVP modules are save, hub, grow and LATER are pay, learn', () => {
    expect(MVP_MODULE_IDS).toEqual(['save', 'hub', 'grow']);
    expect(LATER_MODULE_IDS).toEqual(['pay', 'learn']);
  });

  it('getBrandModuleConfig returns same as BRAND_MODULE_CONFIG[id]', () => {
    ALL_MODULE_IDS.forEach((id) => {
      expect(getBrandModuleConfig(id)).toBe(BRAND_MODULE_CONFIG[id]);
    });
  });

  it('LATER modules have only roadmap and coming_soon in allowedUISurfaces', () => {
    LATER_MODULE_IDS.forEach((id) => {
      const config = BRAND_MODULE_CONFIG[id];
      expect(config.status).toBe('LATER');
      expect(config.allowedUISurfaces).toContain('roadmap');
      expect(config.allowedUISurfaces).toContain('coming_soon');
      expect(config.allowedUISurfaces).not.toContain('nav');
    });
  });

  it('MVP modules include nav and dashboard in allowedUISurfaces', () => {
    MVP_MODULE_IDS.forEach((id) => {
      const config = BRAND_MODULE_CONFIG[id];
      expect(config.allowedUISurfaces).toContain('nav');
      expect(config.allowedUISurfaces).toContain('dashboard');
    });
  });

  it('isModuleAllowedOnSurface returns true for allowed surfaces', () => {
    expect(isModuleAllowedOnSurface('save', 'nav')).toBe(true);
    expect(isModuleAllowedOnSurface('save', 'dashboard')).toBe(true);
    expect(isModuleAllowedOnSurface('pay', 'roadmap')).toBe(true);
    expect(isModuleAllowedOnSurface('pay', 'coming_soon')).toBe(true);
  });

  it('isModuleAllowedOnSurface returns false when surface not in list', () => {
    expect(isModuleAllowedOnSurface('pay', 'nav')).toBe(false);
    expect(isModuleAllowedOnSurface('pay', 'dashboard')).toBe(false);
    expect(isModuleAllowedOnSurface('learn', 'section_header')).toBe(false);
  });

  it('master brand config has id, displayName, shortLabel, legalEntityNote', () => {
    expect(MASTER_BRAND_CONFIG.id).toBe('villagecircle360');
    expect(MASTER_BRAND_CONFIG.displayName).toBe('VillageCircle360');
    expect(MASTER_BRAND_CONFIG.shortLabel).toBeDefined();
    expect(MASTER_BRAND_CONFIG.legalEntityNote).toBeDefined();
    expect(MASTER_BRAND_CONFIG.legalEntityNote.length).toBeGreaterThan(0);
  });
});
