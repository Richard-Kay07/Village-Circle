/**
 * Future modules (VC Pay, VC Learn) – guardrails and placeholder behaviour.
 * Run with: npm run copy:check or npm test
 *
 * @see docs/FUTURE_MODULES_VC_PAY_VC_LEARN.md
 * @see lib/brand/module-visibility.ts
 */

import { BRAND_MODULE_CONFIG, LATER_MODULE_IDS, MVP_MODULE_IDS } from '@/lib/brand/architecture';
import {
  NAV_MODULE_IDS,
  ROUTED_MODULE_IDS,
  isLaterModule,
  getDashboardCardModuleIds,
} from '@/lib/brand/module-visibility';
import { MEMBER_NAV, TREASURER_NAV, ADMIN_NAV } from '@/lib/navigation/nav-maps';
import { COPY_KEYS, getCopy, messages } from '@/lib/copy';
import { findDoNotSayViolation } from '@/lib/brand/do-not-say';

describe('Future modules (VC Pay, VC Learn)', () => {
  it('pay and learn are marked LATER in brand config', () => {
    expect(BRAND_MODULE_CONFIG.pay.status).toBe('LATER');
    expect(BRAND_MODULE_CONFIG.learn.status).toBe('LATER');
    expect(LATER_MODULE_IDS).toContain('pay');
    expect(LATER_MODULE_IDS).toContain('learn');
  });

  it('MVP module IDs do not include pay or learn', () => {
    expect(MVP_MODULE_IDS).not.toContain('pay');
    expect(MVP_MODULE_IDS).not.toContain('learn');
  });

  it('NAV_MODULE_IDS and ROUTED_MODULE_IDS are MVP only (no pay/learn)', () => {
    expect(NAV_MODULE_IDS).toEqual(MVP_MODULE_IDS);
    expect(ROUTED_MODULE_IDS).toEqual(MVP_MODULE_IDS);
    expect(NAV_MODULE_IDS).not.toContain('pay');
    expect(NAV_MODULE_IDS).not.toContain('learn');
  });

  it('no nav items point to /pay or /learn routes', () => {
    const allItems = [
      ...MEMBER_NAV.items,
      ...TREASURER_NAV.items,
      ...ADMIN_NAV.items,
    ];
    const payOrLearn = allItems.filter(
      (item) => item.href.startsWith('/pay') || item.href.startsWith('/learn')
    );
    expect(payOrLearn).toEqual([]);
  });

  it('isLaterModule returns true only for pay and learn', () => {
    expect(isLaterModule('pay')).toBe(true);
    expect(isLaterModule('learn')).toBe(true);
    expect(isLaterModule('save')).toBe(false);
    expect(isLaterModule('hub')).toBe(false);
    expect(isLaterModule('grow')).toBe(false);
  });

  it('getDashboardCardModuleIds returns only MVP when env flag not set', () => {
    const ids = getDashboardCardModuleIds();
    expect(ids).toEqual(expect.arrayContaining(['save', 'hub', 'grow']));
    expect(ids).not.toContain('pay');
    expect(ids).not.toContain('learn');
  });

  it('pay and learn placeholder copy keys exist and are non-empty', () => {
    expect(getCopy(COPY_KEYS.pay_comingLater)).toBeTruthy();
    expect(getCopy(COPY_KEYS.pay_comingSoon)).toBeTruthy();
    expect(getCopy(COPY_KEYS.pay_cardTitle)).toBe('VC Pay');
    expect(getCopy(COPY_KEYS.pay_cardDescription)).toMatch(/not available|later release/i);
    expect(getCopy(COPY_KEYS.learn_comingLater)).toBeTruthy();
    expect(getCopy(COPY_KEYS.learn_comingSoon)).toBeTruthy();
    expect(getCopy(COPY_KEYS.learn_cardTitle)).toBe('VC Learn');
    expect(getCopy(COPY_KEYS.learn_cardDescription)).toMatch(/not available|later release/i);
  });

  it('placeholder copy does not imply current availability (do-not-say)', () => {
    const keys = [
      COPY_KEYS.pay_comingLater,
      COPY_KEYS.pay_comingSoon,
      COPY_KEYS.pay_cardTitle,
      COPY_KEYS.pay_cardDescription,
      COPY_KEYS.pay_roadmapDescription,
      COPY_KEYS.learn_comingLater,
      COPY_KEYS.learn_comingSoon,
      COPY_KEYS.learn_cardTitle,
      COPY_KEYS.learn_cardDescription,
      COPY_KEYS.learn_roadmapDescription,
    ];
    for (const key of keys) {
      const text = messages[key];
      if (typeof text !== 'string') continue;
      const violation = findDoNotSayViolation(text);
      expect(violation).toBeNull();
    }
  });
});
