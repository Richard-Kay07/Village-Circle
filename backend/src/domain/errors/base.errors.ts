import { HttpException, HttpStatus } from '@nestjs/common';

/** Base for domain/API errors with code and optional details. */
export abstract class BaseDomainError extends HttpException {
  constructor(
    message: string,
    public readonly code: string,
    statusCode: HttpStatus,
    public readonly details?: Record<string, unknown>,
  ) {
    super(
      { message, code, ...details },
      statusCode,
    );
  }
}

/** Validation errors (e.g. invalid payload, missing required field). */
export class ValidationError extends BaseDomainError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', HttpStatus.BAD_REQUEST, details);
  }
}

/** Authentication errors (e.g. missing or invalid token). */
export class AuthError extends BaseDomainError {
  constructor(message: string = 'Unauthorized', details?: Record<string, unknown>) {
    super(message, 'AUTH_ERROR', HttpStatus.UNAUTHORIZED, details);
  }
}

/** Forbidden errors (authenticated but not allowed to perform action). */
export class ForbiddenError extends BaseDomainError {
  constructor(message: string = 'Forbidden', details?: Record<string, unknown>) {
    super(message, 'FORBIDDEN_ERROR', HttpStatus.FORBIDDEN, details);
  }
}

/** Domain rule violations (e.g. business rule broken). */
export class DomainRuleError extends BaseDomainError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'DOMAIN_RULE_VIOLATION', HttpStatus.UNPROCESSABLE_ENTITY, details);
  }
}

/** Not found (404). */
export class NotFoundError extends BaseDomainError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'NOT_FOUND', HttpStatus.NOT_FOUND, details);
  }
}
