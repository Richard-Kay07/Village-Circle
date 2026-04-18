import { Decimal as PrismaDecimal } from '@prisma/client/runtime/library';

/**
 * Use Prisma's Decimal for financial amounts (append-only, no float).
 * Convert to number only for API responses when safe.
 */
export function toDecimal(value: string | number | PrismaDecimal): PrismaDecimal {
  if (typeof value === 'string' || typeof value === 'number') {
    return new PrismaDecimal(value);
  }
  return value;
}

export function decimalToNumber(d: PrismaDecimal): number {
  return d.toNumber();
}
