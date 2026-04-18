import { DomainRuleError } from '../domain/errors';

/**
 * Thrown when write-off is invoked but the feature is not yet fully implemented.
 * Endpoint and RBAC are present; execution is blocked with a clear domain error.
 */
export class LoanWriteOffNotImplementedError extends DomainRuleError {
  constructor() {
    super(
      'Loan write-off is not yet implemented; capability reserved for future release. Do not use this endpoint until enabled.',
      { code: 'LOAN_WRITEOFF_NOT_IMPLEMENTED' },
    );
    this.name = 'LoanWriteOffNotImplementedError';
  }
}
