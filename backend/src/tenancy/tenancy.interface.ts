/**
 * Tenancy module interfaces (skeleton). No business logic in Phase 1.1.
 */

export interface ITenancyService {
  /** Resolve tenant group id for the current request (e.g. from header or path). */
  getTenantGroupId(): Promise<string | null>;
  /** Assert that the current request is scoped to a group (throws if not). */
  requireTenantGroupId(): Promise<string>;
}
