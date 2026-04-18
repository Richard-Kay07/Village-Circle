import {
  parseTransactionMode,
  isTransactionMode,
  TransactionMode,
  TRANSACTION_MODE_VALUES,
} from './transaction-mode.enum';

describe('TransactionMode', () => {
  describe('parseTransactionMode', () => {
    it('parses valid string', () => {
      expect(parseTransactionMode('CASH')).toBe(TransactionMode.CASH);
      expect(parseTransactionMode('bank_transfer')).toBe(TransactionMode.BANK_TRANSFER);
    });

    it('throws for invalid value', () => {
      expect(() => parseTransactionMode('CARD')).toThrow('Invalid TransactionMode');
    });

    it('throws for non-string', () => {
      expect(() => parseTransactionMode(1)).toThrow('expected string');
    });
  });

  describe('isTransactionMode', () => {
    it('returns true for valid', () => {
      expect(isTransactionMode('CASH')).toBe(true);
      expect(isTransactionMode('BANK_TRANSFER')).toBe(true);
    });
    it('returns false for invalid', () => {
      expect(isTransactionMode('OTHER')).toBe(false);
    });
  });

  it('TRANSACTION_MODE_VALUES has both values', () => {
    expect(TRANSACTION_MODE_VALUES).toEqual(['CASH', 'BANK_TRANSFER']);
  });
});
