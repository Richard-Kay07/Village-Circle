import {
  parseFundBucket,
  isFundBucket,
  FundBucket,
  FUND_BUCKET_VALUES,
} from './fund-bucket.enum';

describe('FundBucket', () => {
  describe('parseFundBucket', () => {
    it('parses valid string and normalizes dashes to underscores', () => {
      expect(parseFundBucket('SAVINGS')).toBe(FundBucket.SAVINGS);
      expect(parseFundBucket('social-fund')).toBe(FundBucket.SOCIAL_FUND);
      expect(parseFundBucket('LOAN_INTEREST')).toBe(FundBucket.LOAN_INTEREST);
    });

    it('throws for invalid value', () => {
      expect(() => parseFundBucket('UNKNOWN')).toThrow('Invalid FundBucket');
    });

    it('throws for non-string', () => {
      expect(() => parseFundBucket(0)).toThrow('expected string');
    });
  });

  describe('isFundBucket', () => {
    it('returns true for valid buckets', () => {
      expect(isFundBucket('SAVINGS')).toBe(true);
      expect(isFundBucket(FundBucket.PENALTY)).toBe(true);
    });
    it('returns false for invalid', () => {
      expect(isFundBucket('OTHER')).toBe(false);
    });
  });

  it('FUND_BUCKET_VALUES contains expected buckets', () => {
    expect(FUND_BUCKET_VALUES).toContain('SAVINGS');
    expect(FUND_BUCKET_VALUES).toContain('WAIVER_ADJUSTMENT');
    expect(FUND_BUCKET_VALUES.length).toBe(6);
  });
});
