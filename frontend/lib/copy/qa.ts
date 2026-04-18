/**
 * Copy QA utilities – key validation, prohibited wording scan.
 * Used by tests and optional scripts. Run full checks via: npm run copy:check
 *
 * @see docs/COPY_QA_CHECKLIST.md
 * @see lib/brand/do-not-say.ts
 */

import type { CopyKey } from './keys';
import type { CopyMessages } from './messages';

export interface KeyValidationResult {
  missing: CopyKey[];
  duplicate: string[];
  empty: CopyKey[];
}

export interface ProhibitedViolation {
  key: string;
  pattern: string;
  reason: string;
  useInstead: string;
}

/**
 * Validates that every key has a non-empty message. Returns keys with missing or empty messages.
 */
export function getMissingOrEmptyMessageKeys(
  keys: readonly CopyKey[],
  messages: CopyMessages
): CopyKey[] {
  const out: CopyKey[] = [];
  for (const k of keys) {
    const msg = messages[k];
    if (msg === undefined || (typeof msg === 'string' && msg.trim().length === 0)) out.push(k);
  }
  return out;
}

/**
 * Returns duplicate key string values (same value used for more than one key).
 */
export function getDuplicateKeyValues(keys: readonly CopyKey[]): string[] {
  const values = keys as unknown as string[];
  const seen = new Set<string>();
  const duplicates: string[] = [];
  for (const v of values) {
    if (seen.has(v)) {
      if (!duplicates.includes(v)) duplicates.push(v);
    } else seen.add(v);
  }
  return duplicates;
}

/**
 * Full key validation: missing messages, empty messages, duplicate key values.
 */
export function validateCopyKeys(
  keys: readonly CopyKey[],
  messages: CopyMessages
): KeyValidationResult {
  const keyList = Array.isArray(keys) ? keys : (Object.values(keys) as CopyKey[]);
  const missing: CopyKey[] = [];
  const empty: CopyKey[] = [];
  for (const k of keyList) {
    const msg = messages[k];
    if (msg === undefined) missing.push(k);
    else if (typeof msg === 'string' && msg.trim().length === 0) empty.push(k);
  }
  return {
    missing,
    empty,
    duplicate: getDuplicateKeyValues(keyList),
  };
}

export type FindProhibitedFn = (text: string) => { pattern: string; reason: string; useInstead: string } | null;

/**
 * Scans a messages dictionary for prohibited wording. Returns violations.
 */
export function scanMessagesForProhibited(
  messages: Record<string, string | undefined>,
  findProhibited: FindProhibitedFn
): ProhibitedViolation[] {
  const violations: ProhibitedViolation[] = [];
  for (const [key, text] of Object.entries(messages)) {
    if (typeof text !== 'string') continue;
    const hit = findProhibited(text);
    if (hit) {
      violations.push({
        key,
        pattern: hit.pattern,
        reason: hit.reason,
        useInstead: hit.useInstead,
      });
    }
  }
  return violations;
}

