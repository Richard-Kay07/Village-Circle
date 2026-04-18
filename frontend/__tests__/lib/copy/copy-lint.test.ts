/**
 * Copy key lint and governance checks.
 * Run with: npm run copy:check (or jest __tests__/lib/copy/copy-lint.test.ts)
 *
 * - No duplicate keys (key string value must be unique)
 * - Every message passes do-not-say check (no prohibited wording)
 *
 * @see docs/UX_COPY_STYLE_GUIDE.md § Testing and checks
 * @see frontend/lib/brand/do-not-say.ts
 */

import { COPY_KEYS, messages } from '@/lib/copy';
import { findDoNotSayViolation } from '@/lib/brand/do-not-say';
import type { CopyKey } from '@/lib/copy';

describe('Copy key lint', () => {
  it('has no duplicate key string values', () => {
    const values = Object.values(COPY_KEYS) as string[];
    const seen = new Set<string>();
    const duplicates: string[] = [];
    for (const v of values) {
      if (seen.has(v)) duplicates.push(v);
      else seen.add(v);
    }
    expect(duplicates).toEqual([]);
  });

  it('every COPY_KEYS key has a non-empty message', () => {
    const keys = Object.values(COPY_KEYS) as CopyKey[];
    const missing: string[] = [];
    for (const k of keys) {
      const msg = messages[k];
      if (msg === undefined || (typeof msg === 'string' && msg.length === 0)) missing.push(k);
    }
    expect(missing).toEqual([]);
  });

  it('no message contains prohibited/risky wording (do-not-say list)', () => {
    const keys = Object.values(COPY_KEYS) as CopyKey[];
    const violations: { key: string; pattern: string; useInstead: string }[] = [];
    for (const k of keys) {
      const msg = messages[k];
      if (typeof msg !== 'string') continue;
      const hit = findDoNotSayViolation(msg);
      if (hit) {
        violations.push({
          key: k,
          pattern: hit.pattern,
          useInstead: hit.useInstead,
        });
      }
    }
    expect(violations).toEqual([]);
  });
});
