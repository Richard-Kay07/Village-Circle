/**
 * Idempotency result: either the stored response from a previous request
 * or indication that the caller should proceed.
 */
export interface IdempotencyResult<T = unknown> {
  /** True if this request was already processed (same key). */
  isReplay: boolean;
  /** When isReplay is true, the response from the original request. */
  storedResponse?: T;
}

/**
 * Idempotency service interface.
 * Implementation can use DB or cache; stub for Phase 1.1.
 */
export interface IIdempotencyService {
  /**
   * Check whether the idempotency key was already used and return stored response if so.
   * @param scope - e.g. "contribution", "repayment"
   * @param key - client-provided idempotency key
   * @returns Result with isReplay and optional storedResponse
   */
  get<T = unknown>(scope: string, key: string): Promise<IdempotencyResult<T> | null>;

  /**
   * Store the response for an idempotency key after successful processing.
   * @param scope - same as get
   * @param key - same as get
   * @param response - response to store for replay
   * @param ttlSeconds - optional TTL for the entry
   */
  set<T = unknown>(scope: string, key: string, response: T, ttlSeconds?: number): Promise<void>;
}

export const IDEMPOTENCY_SERVICE = 'IdempotencyService';
