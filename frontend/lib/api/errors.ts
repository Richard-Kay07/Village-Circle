export interface ApiErrorBody {
  message?: string;
  code?: string;
  statusCode?: number;
  [key: string]: unknown;
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: Record<string, unknown>;
  response?: Response;
}

export function parseApiError(err: unknown): ApiError {
  if (err && typeof err === 'object' && 'message' in err) {
    return err as ApiError;
  }
  if (err instanceof Error) {
    return Object.assign(err, { status: undefined, code: undefined, details: undefined });
  }
  return Object.assign(new Error(String(err)), { status: undefined, code: undefined, details: undefined });
}

export function mapApiErrorToUserMessage(err: unknown): string {
  const apiErr = parseApiError(err);
  const status = apiErr.status;
  const code = apiErr.code;
  const message = apiErr.message || 'Something went wrong';
  if (status === 403 || code === 'FORBIDDEN_ERROR') return 'You do not have permission to do this.';
  if (status === 401 || code === 'AUTH_ERROR') return 'Please sign in again.';
  if (status === 404 || code === 'NOT_FOUND') return 'The requested item was not found.';
  if (status === 422 || code === 'DOMAIN_RULE_VIOLATION') {
    return message && !message.includes('Error') ? message : 'This action is not allowed in the current state.';
  }
  if (status === 400 || code === 'VALIDATION_ERROR') {
    return message && message.length < 200 ? message : 'Please check your input and try again.';
  }
  if (status && status >= 500) return 'Something went wrong on our side. Please try again later.';
  return message && message.length < 200 ? message : 'Something went wrong. Please try again.';
}

export function isNonRetryableError(err: unknown): boolean {
  const apiErr = parseApiError(err);
  const status = apiErr.status;
  const code = apiErr.code;
  if (status === 400 || status === 401 || status === 403 || status === 404 || status === 422) return true;
  if (code === 'VALIDATION_ERROR' || code === 'FORBIDDEN_ERROR' || code === 'AUTH_ERROR' || code === 'NOT_FOUND' || code === 'DOMAIN_RULE_VIOLATION') return true;
  return false;
}

export function shouldRetryMutation(err: unknown, options: { isFinancial?: boolean }): boolean {
  if (options.isFinancial) return false;
  return !isNonRetryableError(err);
}
