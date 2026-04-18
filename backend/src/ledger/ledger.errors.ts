import { ValidationError, DomainRuleError } from '../domain/errors';
import { NotFoundError } from '../domain/errors';

/** Thrown when posting lines do not balance (sum amountMinor !== 0). */
export class LedgerNotBalancedError extends DomainRuleError {
  constructor(sumAmountMinor: number) {
    super('Ledger posting lines must balance (sum amountMinor must be 0)', { sumAmountMinor });
    this.name = 'LedgerNotBalancedError';
  }
}

/** Thrown when ledger event to reverse is not found. */
export class LedgerEventNotFoundError extends NotFoundError {
  constructor(ledgerEventId: string) {
    super(`Ledger event not found: ${ledgerEventId}`, { ledgerEventId });
  }
}

/** Thrown when ledger event was already reversed. */
export class LedgerEventAlreadyReversedError extends DomainRuleError {
  constructor(ledgerEventId: string) {
    super(`Ledger event already reversed: ${ledgerEventId}`, { ledgerEventId });
  }
}
