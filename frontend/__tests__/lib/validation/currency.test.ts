import { displayToMinor, minorToDisplay, validateMinorUnits } from '@/lib/validation/currency';

describe('displayToMinor', () => {
  it('converts display value to minor units', () => {
    expect(displayToMinor('12.50')).toBe(1250);
    expect(displayToMinor('0')).toBe(0);
    expect(displayToMinor('1')).toBe(100);
  });
});

describe('minorToDisplay', () => {
  it('converts minor units to display string', () => {
    expect(minorToDisplay(1250)).toBe('12.50');
    expect(minorToDisplay(0)).toBe('');
  });
});

describe('validateMinorUnits', () => {
  it('returns undefined when valid', () => {
    expect(validateMinorUnits(100)).toBeUndefined();
  });
  it('returns error for negative', () => {
    expect(validateMinorUnits(-1)).toBe('Amount cannot be negative');
  });
});
