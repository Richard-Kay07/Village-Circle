import { formatGBP, formatGBPCompact } from '@/lib/format/currency';

describe('formatGBP', () => {
  it('formats minor units as GBP with two decimals', () => {
    expect(formatGBP(12345)).toBe('£123.45');
    expect(formatGBP(0)).toBe('£0.00');
    expect(formatGBP(100)).toBe('£1.00');
  });

  it('uses UK locale formatting', () => {
    const result = formatGBP(1000000);
    expect(result).toContain('£');
    expect(result).toMatch(/10,?000\.00/);
  });
});

describe('formatGBPCompact', () => {
  it('formats small amounts like formatGBP', () => {
    expect(formatGBPCompact(5000)).toBe('£50.00');
  });

  it('formats large amounts in compact notation', () => {
    const result = formatGBPCompact(100000000); // 1M pounds in minor
    expect(result).toContain('£');
    expect(result).toMatch(/1/);
  });
});
