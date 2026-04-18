import { getCopy, getCopyTemplate, COPY_KEYS, messages } from '@/lib/copy';

describe('Copy layer', () => {
  it('getCopy returns string for every COPY_KEYS key', () => {
    Object.values(COPY_KEYS).forEach((key) => {
      const value = getCopy(key);
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
    });
  });

  it('common buttons are UK English and audit-friendly', () => {
    expect(getCopy(COPY_KEYS.common_button_retry)).toBe('Try again');
    expect(getCopy(COPY_KEYS.common_button_confirm)).toBe('Confirm');
    expect(getCopy(COPY_KEYS.common_button_cancel)).toBe('Cancel');
  });

  it('MVP safety: member disclaimer states app does not hold or move funds', () => {
    const msg = getCopy(COPY_KEYS.member_mvp_disclaimer);
    expect(msg).toMatch(/recorded/);
    expect(msg.toLowerCase()).toMatch(/does not hold|does not.*move|recorded in the system/);
  });

  it('ops repayment duplicate message is explicit and audit-friendly', () => {
    const msg = getCopy(COPY_KEYS.ops_loan_repay_duplicateMessage);
    expect(msg).toMatch(/already recorded|idempotency|duplicate/);
  });

  it('messages cover all COPY_KEYS', () => {
    const keys = Object.values(COPY_KEYS);
    keys.forEach((key) => {
      expect(messages[key]).toBeDefined();
      expect(messages[key]).toBe(getCopy(key));
    });
  });

  it('getCopyTemplate returns message and substitutes placeholders when present', () => {
    expect(getCopyTemplate(COPY_KEYS.common_permissionDenied, {})).toBe(getCopy(COPY_KEYS.common_permissionDenied));
    expect(getCopyTemplate(COPY_KEYS.immutable_reversalCreated, {})).toBe('A reversal record has been created.');
    const withPlaceholder = getCopyTemplate(COPY_KEYS.common_exampleRecordSummary, {
      amount: '£20.00',
      groupName: 'Tuesday Circle',
    });
    expect(withPlaceholder).toBe('£20.00 recorded for Tuesday Circle.');
  });
});
