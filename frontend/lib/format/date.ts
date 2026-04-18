/**
 * UK local date/time formatting. Input as UTC ISO strings or Date.
 */

const UK_LOCALE = 'en-GB';
const UK_TIMEZONE = 'Europe/London';

/**
 * Format UTC date string or Date as UK local date (DD/MM/YYYY).
 */
export function formatUKDate(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  return new Intl.DateTimeFormat(UK_LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: UK_TIMEZONE,
  }).format(d);
}

/**
 * Format UTC date string or Date as UK local time (HH:MM or HH:MM:SS).
 */
export function formatUKTime(input: string | Date, options?: { seconds?: boolean }): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  return new Intl.DateTimeFormat(UK_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    second: options?.seconds ? '2-digit' : undefined,
    hour12: false,
    timeZone: UK_TIMEZONE,
  }).format(d);
}

/**
 * Format UTC date string or Date as UK local date and time.
 */
export function formatUKDateTime(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  return new Intl.DateTimeFormat(UK_LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: UK_TIMEZONE,
  }).format(d);
}

/**
 * Relative date for "today", "yesterday", or UK date otherwise.
 */
export function formatUKDateRelative(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const dDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
  if (dDate.getTime() === todayDate.getTime()) return 'Today';
  if (dDate.getTime() === yesterdayDate.getTime()) return 'Yesterday';
  return formatUKDate(d);
}
