/**
 * SMS template copy pack – short/standard variants, placeholders, admin failure states.
 * Run with: npm run copy:check (or jest __tests__/lib/copy/sms-copy.test.ts)
 *
 * - All SMS pack keys have non-empty messages
 * - Short variants fit common SMS length constraint (heuristic)
 * - Placeholders are documented and named consistently
 *
 * @see docs/SMS_COPY_SPEC.md
 */

import { COPY_KEYS, getCopy, getCopyTemplate, messages } from '@/lib/copy';
import type { CopyKey } from '@/lib/copy';

/** Single-segment SMS typical max (GSM-7). Heuristic for short variants. */
const SMS_MAX_CHARS = 160;

/** Allowed placeholder names in SMS templates (documented in SMS_COPY_SPEC.md). */
const ALLOWED_PLACEHOLDERS = new Set(['groupName', 'meetingDate', 'amount', 'loanRef', 'appLink']);

/** SMS template pack keys: short and standard variants for MVP use cases. */
const SMS_TEMPLATE_KEYS: CopyKey[] = [
  COPY_KEYS.notifications_sms_meeting_reminder_short,
  COPY_KEYS.notifications_sms_meeting_reminder_standard,
  COPY_KEYS.notifications_sms_contribution_due_short,
  COPY_KEYS.notifications_sms_contribution_due_standard,
  COPY_KEYS.notifications_sms_overdue_repayment_short,
  COPY_KEYS.notifications_sms_overdue_repayment_standard,
  COPY_KEYS.notifications_sms_approval_required_short,
  COPY_KEYS.notifications_sms_approval_required_standard,
  COPY_KEYS.notifications_sms_receipt_confirmation_short,
  COPY_KEYS.notifications_sms_receipt_confirmation_standard,
  COPY_KEYS.notifications_sms_receipt_confirmation_withAmount_standard,
];

/** Short variant keys only (for length check). */
const SMS_SHORT_KEYS: CopyKey[] = [
  COPY_KEYS.notifications_sms_meeting_reminder_short,
  COPY_KEYS.notifications_sms_contribution_due_short,
  COPY_KEYS.notifications_sms_overdue_repayment_short,
  COPY_KEYS.notifications_sms_approval_required_short,
  COPY_KEYS.notifications_sms_receipt_confirmation_short,
];

/** Example vars for length heuristic (typical max lengths). */
const EXAMPLE_VARS: Record<string, string> = {
  groupName: 'Tuesday Circle',
  meetingDate: '15 Mar 2025',
  amount: '£20.00',
  loanRef: 'L-123',
  appLink: 'https://vc360.app/x',
};

function extractPlaceholders(text: string): string[] {
  const matches = text.match(/\{([a-zA-Z]+)\}/g) ?? [];
  return [...new Set(matches.map((m) => m.slice(1, -1)))];
}

describe('SMS copy pack', () => {
  it('every SMS template pack key has a non-empty message', () => {
    const missing: string[] = [];
    const empty: string[] = [];
    for (const key of SMS_TEMPLATE_KEYS) {
      const msg = messages[key];
      if (msg === undefined) missing.push(key);
      else if (typeof msg === 'string' && msg.length === 0) empty.push(key);
    }
    expect(missing).toEqual([]);
    expect(empty).toEqual([]);
  });

  it('link and consent keys have non-empty messages', () => {
    expect(getCopy(COPY_KEYS.notifications_sms_linkOpenApp).length).toBeGreaterThan(0);
    expect(getCopy(COPY_KEYS.notifications_sms_linkViewDetails).length).toBeGreaterThan(0);
    expect(getCopy(COPY_KEYS.notifications_sms_consentReminder).length).toBeGreaterThan(0);
  });

  it('admin delivery failure status keys have non-empty messages', () => {
    expect(getCopy(COPY_KEYS.notifications_system_smsDeliveryFailed_statusFailed).length).toBeGreaterThan(0);
    expect(getCopy(COPY_KEYS.notifications_system_smsDeliveryFailed_statusRetrying).length).toBeGreaterThan(0);
    expect(getCopy(COPY_KEYS.notifications_system_smsDeliveryFailed_statusUndeliverable).length).toBeGreaterThan(0);
  });

  it('short variant interpolations do not exceed SMS length constraint', () => {
    for (const key of SMS_SHORT_KEYS) {
      const rendered = getCopyTemplate(key, EXAMPLE_VARS);
      expect(rendered.length).toBeLessThanOrEqual(SMS_MAX_CHARS);
    }
  });

  it('SMS template placeholders are from the documented allowed set', () => {
    const invalid: { key: string; placeholders: string[] }[] = [];
    for (const key of SMS_TEMPLATE_KEYS) {
      const msg = messages[key];
      if (typeof msg !== 'string') continue;
      const placeholders = extractPlaceholders(msg);
      const bad = placeholders.filter((p) => !ALLOWED_PLACEHOLDERS.has(p));
      if (bad.length > 0) invalid.push({ key, placeholders: bad });
    }
    expect(invalid).toEqual([]);
  });

  it('template interpolation replaces all placeholders', () => {
    const title = getCopyTemplate(COPY_KEYS.notifications_sms_meeting_reminder_short, {
      groupName: 'Test Group',
      meetingDate: '1 Jan 2025',
      appLink: 'Open app',
    });
    expect(title).not.toMatch(/\{[a-zA-Z]+\}/);
    expect(title).toContain('Test Group');
    expect(title).toContain('1 Jan 2025');
    expect(title).toContain('Open app');
  });
});
