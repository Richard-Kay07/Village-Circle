/**
 * Auth module interfaces (skeleton). No business logic in Phase 1.1.
 */

export interface IAuthService {
  /** Validate token/session and return user id if valid. */
  validateRequest(): Promise<string | null>;
  /** Optional: resolve actor user id from request (stub). */
  getActorUserIdFromRequest(): Promise<string | null>;
}
