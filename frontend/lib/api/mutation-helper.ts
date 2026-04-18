import type { UseMutationOptions } from '@tanstack/react-query';
import { mapApiErrorToUserMessage, type ApiError } from './errors';

export interface MutationHelperOptions<TData, TError = ApiError, TVariables = void> {
  /** When true, never retry (use for financial mutations). */
  isFinancial?: boolean;
  /** Override user message from mapped error. */
  getErrorMessage?: (err: TError) => string;
}

/**
 * Wraps TanStack Query useMutation options to:
 * - Map backend errors to user-friendly messages
 * - Optionally disable retry for financial actions
 */
export function mutationHelper<TData, TError = ApiError, TVariables = void>(
  options: MutationHelperOptions<TData, TError, TVariables> = {}
): Partial<UseMutationOptions<TData, TError, TVariables>> {
  const { isFinancial = false, getErrorMessage } = options;
  return {
    retry: (failureCount, error) => {
      if (isFinancial) return false;
      if (failureCount >= 2) return false;
      const apiErr = error as ApiError;
      if (apiErr?.status && [400, 401, 403, 404, 422].includes(apiErr.status)) return false;
      return true;
    },
    meta: { isFinancial },
    ...(getErrorMessage
      ? {}
      : {
          onError: undefined,
          // Caller can use mutation.error and mapApiErrorToUserMessage(mutation.error) in UI
        }),
  };
}

/**
 * Get user-facing error message for a mutation error (for display in toast/form).
 */
export function getMutationErrorMessage(err: unknown, customMap?: (e: unknown) => string): string {
  if (customMap) return customMap(err);
  return mapApiErrorToUserMessage(err);
}
