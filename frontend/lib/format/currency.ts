/**
 * UK GBP currency formatting. Input in minor units (pence) for API alignment.
 */

const GBP_LOCALE = 'en-GB';
const CURRENCY_GBP = 'GBP';

/**
 * Format amount in minor units (pence) as GBP for display.
 * e.g. 12345 -> "£123.45"
 */
export function formatGBP(minorUnits: number): string {
  const value = minorUnits / 100;
  return new Intl.NumberFormat(GBP_LOCALE, {
    style: 'currency',
    currency: CURRENCY_GBP,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format GBP with optional compact style for large amounts.
 */
export function formatGBPCompact(minorUnits: number): string {
  const value = minorUnits / 100;
  if (Math.abs(value) >= 1000000) {
    return new Intl.NumberFormat(GBP_LOCALE, {
      style: 'currency',
      currency: CURRENCY_GBP,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }
  return formatGBP(minorUnits);
}
