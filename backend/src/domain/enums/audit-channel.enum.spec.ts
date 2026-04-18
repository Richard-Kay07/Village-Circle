import {
  parseAuditChannel,
  isAuditChannel,
  AuditChannel,
  AUDIT_CHANNEL_VALUES,
} from './audit-channel.enum';

describe('AuditChannel', () => {
  describe('parseAuditChannel', () => {
    it('parses valid string and normalizes dashes', () => {
      expect(parseAuditChannel('WEB')).toBe(AuditChannel.WEB);
      expect(parseAuditChannel('mobile-app')).toBe(AuditChannel.MOBILE_APP);
      expect(parseAuditChannel('SMS_WEBHOOK')).toBe(AuditChannel.SMS_WEBHOOK);
    });

    it('throws for invalid value', () => {
      expect(() => parseAuditChannel('API')).toThrow('Invalid AuditChannel');
    });

    it('throws for non-string', () => {
      expect(() => parseAuditChannel(true)).toThrow('expected string');
    });
  });

  describe('isAuditChannel', () => {
    it('returns true for valid channels', () => {
      expect(isAuditChannel('SYSTEM')).toBe(true);
      expect(isAuditChannel(AuditChannel.ADMIN_PORTAL)).toBe(true);
    });
    it('returns false for invalid', () => {
      expect(isAuditChannel('EMAIL')).toBe(false);
    });
  });

  it('AUDIT_CHANNEL_VALUES has 5 channels', () => {
    expect(AUDIT_CHANNEL_VALUES.length).toBe(5);
    expect(AUDIT_CHANNEL_VALUES).toContain('SMS_WEBHOOK');
  });
});
