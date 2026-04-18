/**
 * Stub for tenant-level rules. MVP: no tenant requires evidence for BANK_TRANSFER.
 * Structure allows future config lookup (e.g. group settings or feature flags).
 */
export function tenantRequiresEvidenceForBankTransfer(_tenantGroupId: string): boolean {
  return false;
}
