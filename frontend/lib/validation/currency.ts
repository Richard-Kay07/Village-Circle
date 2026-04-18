export function displayToMinor(displayValue: string): number {
  const parsed = parseFloat(displayValue.replace(/,/g, ''));
  if (Number.isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}

export function minorToDisplay(minorUnits: number): string {
  if (minorUnits === 0) return '';
  const value = minorUnits / 100;
  return value % 1 === 0 ? String(value) : value.toFixed(2);
}

export function validateMinorUnits(minor: number, options?: { min?: number; max?: number; required?: boolean }): string | undefined {
  if (options?.required && (minor === undefined || minor === null)) return 'Amount is required';
  if (!Number.isInteger(minor)) return 'Amount must be a whole number of pence';
  if (minor < 0) return 'Amount cannot be negative';
  if (options?.min != null && minor < options.min) return 'Minimum is ' + options.min / 100;
  if (options?.max != null && minor > options.max) return 'Maximum is ' + options.max / 100;
  return undefined;
}
