import { mapApiErrorToUserMessage, isNonRetryableError } from '@/lib/api/errors';

describe('mapApiErrorToUserMessage', () => {
  it('maps 403 to permission message', () => {
    expect(mapApiErrorToUserMessage(Object.assign(new Error('Forbidden'), { status: 403 }))).toBe(
      'You do not have permission to do this.'
    );
  });
  it('maps validation error to message when short', () => {
    expect(mapApiErrorToUserMessage(Object.assign(new Error('Amount must be positive'), { status: 400, code: 'VALIDATION_ERROR' }))).toBe(
      'Amount must be positive'
    );
  });
  it('maps 500 to generic server message', () => {
    expect(mapApiErrorToUserMessage(Object.assign(new Error('Internal'), { status: 500 }))).toContain('try again later');
  });
});

describe('isNonRetryableError', () => {
  it('returns true for 400, 401, 403, 404, 422', () => {
    expect(isNonRetryableError(Object.assign(new Error(''), { status: 400 }))).toBe(true);
    expect(isNonRetryableError(Object.assign(new Error(''), { status: 403 }))).toBe(true);
  });
  it('returns false for 500', () => {
    expect(isNonRetryableError(Object.assign(new Error(''), { status: 500 }))).toBe(false);
  });
});
