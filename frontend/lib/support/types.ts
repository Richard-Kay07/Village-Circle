/**
 * Support access context for reason-coded admin/support workflows.
 * Persisted in sessionStorage for the session scope.
 */
export interface SupportAccessState {
  supportCaseOrIncidentId: string;
  reasonCode: string;
  tenantGroupId: string;
  actorUserId: string;
}

const STORAGE_KEY = 'village_support_access';

function load(): SupportAccessState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SupportAccessState;
    if (
      parsed &&
      typeof parsed.supportCaseOrIncidentId === 'string' &&
      typeof parsed.reasonCode === 'string' &&
      typeof parsed.tenantGroupId === 'string' &&
      typeof parsed.actorUserId === 'string'
    ) {
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}

function save(state: SupportAccessState | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (state) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

export const supportStorage = { load, save };
