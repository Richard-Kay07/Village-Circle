/**
 * Legal and compliance UX copy – placeholders and MVP-safe disclaimers.
 * Run with: npm run copy:check (or jest __tests__/lib/copy/legal-copy.test.ts)
 *
 * - All legal_ keys have non-empty messages (no hardcoded legal copy)
 * - Module recordkeeping disclaimers use MVP-safe language (do-not-say)
 *
 * @see docs/LEGAL_UX_COPY.md
 */

import { COPY_KEYS, messages, getCopy } from '@/lib/copy';
import { findDoNotSayViolation } from '@/lib/brand/do-not-say';
import type { CopyKey } from '@/lib/copy';

const LEGAL_PREFIX = 'legal_';

function isLegalKey(key: string): boolean {
  return key.startsWith(LEGAL_PREFIX);
}

const RECORDKEEPING_AND_NONBANK_KEYS: CopyKey[] = [
  COPY_KEYS.legal_nonBankDisclaimer_short,
  COPY_KEYS.legal_nonBankDisclaimer_full,
  COPY_KEYS.legal_recordkeepingNotice_save_short,
  COPY_KEYS.legal_recordkeepingNotice_save_full,
  COPY_KEYS.legal_recordkeepingNotice_hub_short,
  COPY_KEYS.legal_recordkeepingNotice_hub_full,
  COPY_KEYS.legal_recordkeepingNotice_grow_short,
  COPY_KEYS.legal_recordkeepingNotice_grow_full,
];

describe('Legal UX copy', () => {
  it('every legal_ key has a non-empty message (placeholders referenced, not hardcoded)', () => {
    const keys = Object.values(COPY_KEYS) as CopyKey[];
    const legalKeys = keys.filter((k) => isLegalKey(k));
    const missing: string[] = [];
    const empty: string[] = [];
    for (const key of legalKeys) {
      const msg = messages[key];
      if (msg === undefined) missing.push(key);
      else if (typeof msg === 'string' && msg.length === 0) empty.push(key);
    }
    expect(missing).toEqual([]);
    expect(empty).toEqual([]);
  });

  it('module disclaimers and non-bank copy use MVP-safe language (no do-not-say violation)', () => {
    const violations: { key: string; pattern: string }[] = [];
    for (const key of RECORDKEEPING_AND_NONBANK_KEYS) {
      const msg = messages[key];
      if (typeof msg !== 'string') continue;
      const hit = findDoNotSayViolation(msg);
      if (hit) violations.push({ key, pattern: hit.pattern });
    }
    expect(violations).toEqual([]);
  });

  it('getCopy returns legal_ messages for all legal keys', () => {
    const keys = Object.values(COPY_KEYS) as CopyKey[];
    const legalKeys = keys.filter((k) => isLegalKey(k));
    for (const key of legalKeys) {
      const text = getCopy(key);
      expect(text).toBeDefined();
      expect(typeof text).toBe('string');
      expect(text.length).toBeGreaterThan(0);
      expect(text).not.toBe(key);
    }
  });
});
