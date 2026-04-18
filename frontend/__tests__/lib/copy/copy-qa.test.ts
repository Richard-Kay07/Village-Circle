/**
 * Copy QA utilities – prohibited wording scanner and key validation.
 * Run with: npm run copy:check
 *
 * @see lib/copy/qa.ts
 * @see lib/brand/do-not-say.ts
 */

import { COPY_KEYS, messages } from '@/lib/copy';
import { findDoNotSayViolation } from '@/lib/brand/do-not-say';
import type { CopyKey, CopyMessages } from '@/lib/copy';
import {
  getMissingOrEmptyMessageKeys,
  getDuplicateKeyValues,
  validateCopyKeys,
  scanMessagesForProhibited,
} from '@/lib/copy/qa';

describe('Prohibited wording scanner', () => {
  it('detects wording implying platform executes transfer', () => {
    expect(findDoNotSayViolation('Payment sent by VC')).not.toBeNull();
    expect(findDoNotSayViolation('We transferred funds to you')).not.toBeNull();
    expect(findDoNotSayViolation('Record bank transfer')).toBeNull();
  });

  it('detects bank account / wallet when not implemented', () => {
    expect(findDoNotSayViolation('Your bank account balance')).not.toBeNull();
    expect(findDoNotSayViolation('Top up your wallet')).not.toBeNull();
    expect(findDoNotSayViolation('Savings total (recorded)')).toBeNull();
  });

  it('detects edit payment / edit contribution (reversal required)', () => {
    expect(findDoNotSayViolation('Edit payment')).not.toBeNull();
    expect(findDoNotSayViolation('Change contribution amount')).not.toBeNull();
    expect(findDoNotSayViolation('Reverse record and create a new one')).toBeNull();
  });

  it('detects platform as lender', () => {
    expect(findDoNotSayViolation('Lending by the platform')).not.toBeNull();
    expect(findDoNotSayViolation('VC acts as a lender')).not.toBeNull();
    expect(findDoNotSayViolation('Group-managed loan')).toBeNull();
  });

  it('scanMessagesForProhibited returns violations for sample bad messages', () => {
    const findProhibited = (text: string) => findDoNotSayViolation(text);
    const badMessages: Record<string, string> = {
      good_key: 'Record contribution',
      bad_key: 'Edit payment to fix the amount',
    };
    const violations = scanMessagesForProhibited(badMessages, findProhibited);
    expect(violations.length).toBe(1);
    expect(violations[0].key).toBe('bad_key');
    expect(violations[0].pattern).toBeDefined();
    expect(violations[0].useInstead).toMatch(/reverse|Reverse/);
  });

  it('scanMessagesForProhibited returns empty for all-clean messages', () => {
    const findProhibited = (text: string) => findDoNotSayViolation(text);
    const clean: Record<string, string> = {
      a: 'Record repayment',
      b: 'Contribution recorded.',
      c: 'This app does not hold or move funds.',
    };
    const violations = scanMessagesForProhibited(clean, findProhibited);
    expect(violations).toEqual([]);
  });
});

describe('Key validation utilities', () => {
  const allKeys = Object.values(COPY_KEYS) as CopyKey[];

  it('getMissingOrEmptyMessageKeys returns empty when every key has message', () => {
    const missing = getMissingOrEmptyMessageKeys(allKeys, messages);
    expect(missing).toEqual([]);
  });

  it('getDuplicateKeyValues returns empty when no duplicate key string values', () => {
    const duplicates = getDuplicateKeyValues(allKeys);
    expect(duplicates).toEqual([]);
  });

  it('validateCopyKeys returns no missing/empty/duplicate for real keys and messages', () => {
    const result = validateCopyKeys(allKeys, messages);
    expect(result.missing).toEqual([]);
    expect(result.empty).toEqual([]);
    expect(result.duplicate).toEqual([]);
  });

  it('getDuplicateKeyValues detects duplicates in synthetic key list', () => {
    const keysWithDup = ['a', 'b', 'a', 'c', 'b'] as unknown as CopyKey[];
    const dup = getDuplicateKeyValues(keysWithDup);
    expect(dup).toContain('a');
    expect(dup).toContain('b');
    expect(dup).not.toContain('c');
  });

  it('getMissingOrEmptyMessageKeys detects missing and empty in synthetic data', () => {
    const keys = ['k1', 'k2', 'k3'] as unknown as CopyKey[];
    const msgs: Partial<CopyMessages> = { k1: 'Hello', k2: '', k3: '  ' } as Partial<CopyMessages>;
    const missing = getMissingOrEmptyMessageKeys(keys, msgs as CopyMessages);
    expect(missing).toContain('k2');
    expect(missing).toContain('k3');
    expect(missing).not.toContain('k1');
  });
});
