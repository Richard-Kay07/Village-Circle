-- Add index for audit log queries by tenant and time (support filtered lists, trace)
CREATE INDEX "AuditLog_tenantGroupId_createdAt_idx" ON "AuditLog"("tenantGroupId", "createdAt");
