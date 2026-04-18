/**
 * How money is moved in the group (record-keeping only in MVP).
 */
export enum TransactionMode {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export const TRANSACTION_MODE_VALUES: readonly string[] = Object.values(TransactionMode) as string[];

export function parseTransactionMode(value: unknown): TransactionMode {
  if (typeof value !== 'string') {
    throw new Error(`Invalid TransactionMode: expected string, got ${typeof value}`);
  }
  const upper = value.toUpperCase();
  if (!TRANSACTION_MODE_VALUES.includes(upper)) {
    throw new Error(`Invalid TransactionMode: ${value}. Allowed: ${TRANSACTION_MODE_VALUES.join(', ')}`);
  }
  return upper as TransactionMode;
}

export function isTransactionMode(value: unknown): value is TransactionMode {
  return typeof value === 'string' && TRANSACTION_MODE_VALUES.includes(value);
}
