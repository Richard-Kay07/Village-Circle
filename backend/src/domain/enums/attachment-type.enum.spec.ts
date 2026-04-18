import {
  parseAttachmentType,
  isAttachmentType,
  AttachmentType,
  ATTACHMENT_TYPE_VALUES,
} from './attachment-type.enum';

describe('AttachmentType', () => {
  describe('parseAttachmentType', () => {
    it('parses valid string and normalizes dashes', () => {
      expect(parseAttachmentType('TRANSACTION_EVIDENCE')).toBe(
        AttachmentType.TRANSACTION_EVIDENCE,
      );
      expect(parseAttachmentType('meeting-minutes')).toBe(AttachmentType.MEETING_MINUTES);
      expect(parseAttachmentType('OTHER')).toBe(AttachmentType.OTHER);
    });

    it('throws for invalid value', () => {
      expect(() => parseAttachmentType('IMAGE')).toThrow('Invalid AttachmentType');
    });

    it('throws for non-string', () => {
      expect(() => parseAttachmentType({})).toThrow('expected string');
    });
  });

  describe('isAttachmentType', () => {
    it('returns true for valid types', () => {
      expect(isAttachmentType('OTHER')).toBe(true);
      expect(isAttachmentType(AttachmentType.TRANSACTION_EVIDENCE)).toBe(true);
    });
    it('returns false for invalid', () => {
      expect(isAttachmentType('DOCUMENT')).toBe(false);
    });
  });

  it('ATTACHMENT_TYPE_VALUES has 3 types', () => {
    expect(ATTACHMENT_TYPE_VALUES.length).toBe(3);
    expect(ATTACHMENT_TYPE_VALUES).toContain('MEETING_MINUTES');
  });
});
