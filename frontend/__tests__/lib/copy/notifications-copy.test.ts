/**
 * Notifications and in-app operational messaging copy – keys and channel variants.
 * Run with: npm run copy:check (or jest __tests__/lib/copy/notifications-copy.test.ts)
 *
 * - All MVP notification use case keys exist and have non-empty messages
 * - SMS variant interpolation examples do not exceed documented mobile length (heuristic)
 *
 * @see docs/NOTIFICATIONS_COPY_SPEC.md
 */

import { COPY_KEYS, getCopy, getCopyTemplate, messages } from '@/lib/copy';
import type { CopyKey } from '@/lib/copy';

const NOTIFICATIONS_PREFIX = 'notifications_';

function isNotificationsKey(key: string): boolean {
  return key.startsWith(NOTIFICATIONS_PREFIX);
}

/** MVP use case keys: at least one title, body, and CTA per use case */
const MVP_NOTIFICATION_USE_CASES: Record<string, CopyKey[]> = {
  meeting_reminder: [
    COPY_KEYS.notifications_meeting_reminder_title_inApp,
    COPY_KEYS.notifications_meeting_reminder_title_sms,
    COPY_KEYS.notifications_meeting_reminder_body_inApp,
    COPY_KEYS.notifications_meeting_reminder_body_sms,
    COPY_KEYS.notifications_meeting_reminder_cta,
  ],
  contribution_dueReminder: [
    COPY_KEYS.notifications_contribution_dueReminder_title_inApp,
    COPY_KEYS.notifications_contribution_dueReminder_title_sms,
    COPY_KEYS.notifications_contribution_dueReminder_body_inApp,
    COPY_KEYS.notifications_contribution_dueReminder_body_sms,
    COPY_KEYS.notifications_contribution_dueReminder_cta,
  ],
  contribution_receipt: [
    COPY_KEYS.notifications_contribution_receipt_title_inApp,
    COPY_KEYS.notifications_contribution_receipt_title_sms,
    COPY_KEYS.notifications_contribution_receipt_body_inApp,
    COPY_KEYS.notifications_contribution_receipt_body_sms,
    COPY_KEYS.notifications_contribution_receipt_cta,
  ],
  approval_required: [
    COPY_KEYS.notifications_approval_required_title_inApp,
    COPY_KEYS.notifications_approval_required_title_sms,
    COPY_KEYS.notifications_approval_required_body_inApp,
    COPY_KEYS.notifications_approval_required_body_sms,
    COPY_KEYS.notifications_approval_required_cta,
  ],
  approval_decision: [
    COPY_KEYS.notifications_approval_decision_approved_title_inApp,
    COPY_KEYS.notifications_approval_decision_approved_title_sms,
    COPY_KEYS.notifications_approval_decision_rejected_title_inApp,
    COPY_KEYS.notifications_approval_decision_rejected_title_sms,
    COPY_KEYS.notifications_approval_decision_body_approved_inApp,
    COPY_KEYS.notifications_approval_decision_body_rejected_inApp,
    COPY_KEYS.notifications_approval_decision_body_sms,
    COPY_KEYS.notifications_approval_decision_cta,
  ],
  loan_overdueReminder: [
    COPY_KEYS.notifications_loan_overdueReminder_title_inApp,
    COPY_KEYS.notifications_loan_overdueReminder_title_sms,
    COPY_KEYS.notifications_loan_overdueReminder_body_inApp,
    COPY_KEYS.notifications_loan_overdueReminder_body_sms,
    COPY_KEYS.notifications_loan_overdueReminder_cta,
  ],
  system_smsDeliveryFailed: [
    COPY_KEYS.notifications_system_smsDeliveryFailed_title,
    COPY_KEYS.notifications_system_smsDeliveryFailed_body,
    COPY_KEYS.notifications_system_smsDeliveryFailed_cta,
  ],
};

/** Single-segment SMS typical max (GSM-7). Heuristic only. */
const SMS_MAX_CHARS = 160;

describe('Notifications copy', () => {
  it('every notifications_ key has a non-empty message', () => {
    const keys = Object.values(COPY_KEYS) as CopyKey[];
    const notificationKeys = keys.filter(isNotificationsKey);
    const missing: string[] = [];
    const empty: string[] = [];
    for (const key of notificationKeys) {
      const msg = messages[key];
      if (msg === undefined) missing.push(key);
      else if (typeof msg === 'string' && msg.length === 0) empty.push(key);
    }
    expect(missing).toEqual([]);
    expect(empty).toEqual([]);
  });

  it('all MVP notification use cases have keys present with non-empty messages', () => {
    for (const [useCase, keys] of Object.entries(MVP_NOTIFICATION_USE_CASES)) {
      for (const key of keys) {
        const msg = messages[key];
        expect(msg).toBeDefined();
        expect(typeof msg).toBe('string');
        expect((msg as string).length).toBeGreaterThan(0);
      }
    }
  });

  it('getCopy returns non-key string for all notifications_ keys', () => {
    const keys = Object.values(COPY_KEYS) as CopyKey[];
    const notificationKeys = keys.filter(isNotificationsKey);
    for (const key of notificationKeys) {
      const text = getCopy(key);
      expect(text).toBeDefined();
      expect(typeof text).toBe('string');
      expect(text.length).toBeGreaterThan(0);
      expect(text).not.toBe(key);
    }
  });

  it('template interpolation produces expected content for meeting reminder', () => {
    const title = getCopyTemplate(COPY_KEYS.notifications_meeting_reminder_title_inApp, {
      groupName: 'Tuesday Circle',
      meetingName: 'March 2025',
      meetingDate: '15 Mar 2025',
    });
    expect(title).toContain('March 2025');
    const bodySms = getCopyTemplate(COPY_KEYS.notifications_meeting_reminder_body_sms, {
      groupName: 'Tuesday Circle',
    });
    expect(bodySms).toContain('Tuesday Circle');
  });

  it('SMS variant interpolation examples do not exceed heuristic mobile length', () => {
    const examples: { key: CopyKey; vars: Record<string, string> }[] = [
      { key: COPY_KEYS.notifications_meeting_reminder_title_sms, vars: { groupName: 'Tuesday Circle' } },
      { key: COPY_KEYS.notifications_meeting_reminder_body_sms, vars: { groupName: 'Tuesday Circle' } },
      { key: COPY_KEYS.notifications_contribution_dueReminder_title_sms, vars: {} },
      { key: COPY_KEYS.notifications_contribution_dueReminder_body_sms, vars: {} },
      { key: COPY_KEYS.notifications_contribution_receipt_title_sms, vars: {} },
      { key: COPY_KEYS.notifications_contribution_receipt_body_sms, vars: {} },
      { key: COPY_KEYS.notifications_loan_overdueReminder_title_sms, vars: {} },
      { key: COPY_KEYS.notifications_loan_overdueReminder_body_sms, vars: {} },
      { key: COPY_KEYS.notifications_approval_required_title_sms, vars: {} },
      { key: COPY_KEYS.notifications_approval_required_body_sms, vars: {} },
      { key: COPY_KEYS.notifications_approval_decision_approved_title_sms, vars: {} },
      { key: COPY_KEYS.notifications_approval_decision_rejected_title_sms, vars: {} },
      { key: COPY_KEYS.notifications_approval_decision_body_sms, vars: {} },
    ];
    for (const { key, vars } of examples) {
      const rendered = getCopyTemplate(key, vars);
      expect(rendered.length).toBeLessThanOrEqual(SMS_MAX_CHARS);
    }
  });
});
