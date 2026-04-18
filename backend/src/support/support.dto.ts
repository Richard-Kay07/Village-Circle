/**
 * DTOs for admin/support endpoints. All require reasonCode and supportCaseOrIncidentId.
 */
export interface SupportAccessDto {
  reasonCode: string;
  supportCaseOrIncidentId: string;
  actorUserId: string;
  tenantGroupId: string;
}

export interface AuditLogFilterDto extends SupportAccessDto {
  entityType?: string;
  entityId?: string;
  action?: string;
  fromDate?: string; // ISO
  toDate?: string; // ISO
  limit?: number;
  cursor?: string; // sequenceNo (opaque)
}

export interface SmsFailuresFilterDto extends SupportAccessDto {
  limit?: number;
  cursor?: string; // notification id for cursor-based page
}

export interface EvidenceAccessFilterDto extends SupportAccessDto {
  evidenceFileId?: string;
  limit?: number;
  cursor?: string;
}

export interface EntityTraceQueryDto extends SupportAccessDto {
  /** For trace: tenantGroupId is required to scope the entity. */
  tenantGroupId: string;
}

