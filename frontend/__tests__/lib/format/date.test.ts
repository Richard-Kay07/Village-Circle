import { formatUKDate, formatUKTime, formatUKDateTime, formatUKDateRelative } from '@/lib/format/date';

describe('formatUKDate', () => {
  it('formats UTC date as UK local DD/MM/YYYY', () => {
    const d = '2025-03-15T00:00:00.000Z';
    const result = formatUKDate(d);
    expect(result).toMatch(/\d{2}\/\d{2}\/2025/);
  });

  it('accepts Date object', () => {
    const result = formatUKDate(new Date('2025-01-01T12:00:00.000Z'));
    expect(result).toMatch(/\d{2}\/\d{2}\/2025/);
  });
});

describe('formatUKTime', () => {
  it('formats time in 24h', () => {
    const result = formatUKTime('2025-03-15T14:30:00.000Z');
    expect(result).toMatch(/\d{2}:\d{2}/);
  });
});

describe('formatUKDateTime', () => {
  it('formats date and time', () => {
    const result = formatUKDateTime('2025-03-15T14:30:00.000Z');
    expect(result).toMatch(/\d{2}\/\d{2}\/2025/);
    expect(result).toMatch(/\d{2}:\d{2}/);
  });
});

describe('formatUKDateRelative', () => {
  it('returns Today for today date', () => {
    const today = new Date();
    expect(formatUKDateRelative(today)).toBe('Today');
  });

  it('returns Yesterday for yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(formatUKDateRelative(yesterday)).toBe('Yesterday');
  });

  it('returns formatted date for other days', () => {
    const result = formatUKDateRelative('2020-01-15T12:00:00.000Z');
    expect(result).toMatch(/\d{2}\/\d{2}\/2020/);
  });
});
