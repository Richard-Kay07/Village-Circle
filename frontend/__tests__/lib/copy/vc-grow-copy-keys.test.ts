/**
 * Validates VC Grow copy keys: existence, interest on/off from booleans,
 * and that grow_ messages do not violate prohibited wording.
 *
 * @see docs/VC_GROW_COPY_SPEC.md
 */

import { COPY_KEYS, getCopy, getCopyTemplate, messages } from '@/lib/copy';
import { findDoNotSayViolation } from '@/lib/brand/do-not-say';
import type { CopyKey } from '@/lib/copy';

const GROW_KEY_PREFIX = 'grow_';

function isGrowKey(key: string): boolean {
  return key.startsWith(GROW_KEY_PREFIX);
}

describe('VC Grow copy keys', () => {
  it('every grow_ key has a non-empty message', () => {
    const keys = Object.values(COPY_KEYS) as CopyKey[];
    const growKeys = keys.filter(isGrowKey);
    const missing: string[] = [];
    const empty: string[] = [];
    for (const key of growKeys) {
      const msg = messages[key];
      if (msg === undefined) missing.push(key);
      else if (typeof msg === 'string' && msg.length === 0) empty.push(key);
    }
    expect(missing).toEqual([]);
    expect(empty).toEqual([]);
  });

  it('interest on/off copy renders correctly from booleans', () => {
    const enabledLabel = getCopy(COPY_KEYS.grow_interest_enabled);
    const disabledLabel = getCopy(COPY_KEYS.grow_interest_disabled);
    expect(enabledLabel).toBe('Yes');
    expect(disabledLabel).toBe('No');

    const detailEnabled = getCopy(COPY_KEYS.grow_loan_detail_interestEnabled);
    const detailDisabled = getCopy(COPY_KEYS.grow_loan_detail_interestDisabled);
    expect(detailEnabled).toBe('Enabled');
    expect(detailDisabled).toBe('Disabled');

    const whenEnabled = getCopyTemplate(COPY_KEYS.grow_interest_mayApply, { rate: '2.50' });
    expect(whenEnabled).toContain('2.50');
    expect(whenEnabled).toMatch(/interest may apply|terms set at approval/i);

    const whenDisabled = getCopy(COPY_KEYS.grow_interest_doesNotApply);
    expect(whenDisabled).toMatch(/does not apply|interest/i);
  });

  it('no grow_ message violates prohibited wording (do-not-say)', () => {
    const keys = Object.values(COPY_KEYS) as CopyKey[];
    const growKeys = keys.filter(isGrowKey);
    const violations: { key: string; pattern: string }[] = [];
    for (const key of growKeys) {
      const msg = messages[key];
      if (typeof msg !== 'string') continue;
      const hit = findDoNotSayViolation(msg);
      if (hit) violations.push({ key, pattern: hit.pattern });
    }
    expect(violations).toEqual([]);
  });
});
