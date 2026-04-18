import {
  ValidationError,
  AuthError,
  ForbiddenError,
  DomainRuleError,
} from './base.errors';

describe('Base errors', () => {
  it('ValidationError has code and status 400', () => {
    const err = new ValidationError('Invalid amount');
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.getStatus()).toBe(400);
    expect(err.message).toBe('Invalid amount');
  });

  it('AuthError has code and status 401', () => {
    const err = new AuthError('Invalid token');
    expect(err.code).toBe('AUTH_ERROR');
    expect(err.getStatus()).toBe(401);
  });

  it('ForbiddenError has code and status 403', () => {
    const err = new ForbiddenError('Not allowed');
    expect(err.code).toBe('FORBIDDEN_ERROR');
    expect(err.getStatus()).toBe(403);
  });

  it('DomainRuleError has code and status 422', () => {
    const err = new DomainRuleError('Insufficient balance', { balance: 0 });
    expect(err.code).toBe('DOMAIN_RULE_VIOLATION');
    expect(err.getStatus()).toBe(422);
    expect(err.details).toEqual({ balance: 0 });
  });
});
