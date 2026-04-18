# RBAC + Audit usage (VillageCircle360)

## RBAC

### Enforce at service layer (required)

Every privileged action must call `RbacService.requirePermission` (or `requireRole`) in the service, even when a route guard is used:

```ts
// In a domain service (e.g. ContributionService)
async post(params: PostContributionParams, channel: AuditChannel): Promise<{ id: string }> {
  await this.rbac.requirePermission(
    params.tenantGroupId,
    params.actorUserId ?? null,
    Permission.CONTRIBUTION_RECORD,
    {},
    params.actorMemberId,
  );
  // ... business logic
}
```

### Route guard (optional but recommended)

Use `@RequirePermission(Permission.X)` and `RequirePermissionGuard` so unauthenticated or wrong-tenant requests fail fast:

```ts
@Post()
@UseGuards(RequirePermissionGuard)
@RequirePermission(Permission.CONTRIBUTION_RECORD)
post(@Body() dto: PostContributionDto) {
  return this.contributionService.post(dto);
}
```

Request must include `tenantGroupId` (params or body) and `actorUserId` or `actorMemberId` (body or query).

### Segregation of duties (dual control)

For high-risk actions (e.g. `LOAN_APPROVE`, `CONTRIBUTION_REVERSE`), pass `dualControlEnabled` and `creatorUserId` so the same user cannot both create and approve:

```ts
await this.rbac.requirePermission(
  tenantGroupId,
  actorUserId,
  Permission.LOAN_APPROVE,
  { dualControlEnabled: true, creatorUserId: loan.createdByUserId },
  memberIdFallback,
);
```

### Tenant-scoped roles

Roles are resolved per group. A user can be GROUP_CHAIR in one group and MEMBER in another. Use `getRolesForActor(tenantGroupId, actorUserId, memberIdFallback)` to inspect roles.

---

## Audit

### Append-only

All audit writes go through `AuditLogService.append` or `AuditEmitterService` helpers. There are no update/delete methods.

### Typed helpers (AuditEmitterService)

```ts
// Entity created
await this.auditEmitter.entityCreated({
  tenantGroupId: group.id,
  entityType: 'CONTRIBUTION',
  entityId: contribution.id,
  actorUserId: params.actorUserId ?? null,
  channel,
  afterSnapshot: { amount: params.amount, memberId: params.memberId },
  metadata: { requestId: ctx.requestId },
});

// Entity updated (before/after)
await this.auditEmitter.entityUpdated({
  tenantGroupId: group.id,
  entityType: 'LOAN',
  entityId: loan.id,
  actorUserId,
  channel,
  beforeSnapshot: { status: 'PENDING' },
  afterSnapshot: { status: 'DISBURSED' },
});

// Reversal
await this.auditEmitter.entityReversed({
  tenantGroupId,
  entityType: 'CONTRIBUTION',
  entityId: contributionId,
  actorUserId,
  channel,
  reasonCode: params.reasonCode,
});
```

### Single write (AuditLogService.append)

For custom actions, use the single write method:

```ts
await this.auditLog.append({
  tenantGroupId,
  actorUserId,
  channel: AuditChannel.WEB,
  action: 'DISBURSED',
  entityType: 'LOAN',
  entityId: loan.id,
  afterSnapshot: { disbursedAt: now.toISOString() },
});
```

### Support access (reason code required)

Admin/support access must log with a reason code and case/incident id. Call `AuditLogService.logSupportAccess` (or `AuditEmitterService.logSupportAccess`). Missing `reasonCode` or `supportCaseOrIncidentId` throws `SupportAccessReasonRequiredError`:

```ts
await this.auditLog.logSupportAccess({
  supportCaseOrIncidentId: 'INC-123',
  reasonCode: 'CUSTOMER_REQUEST',
  actorUserId: supportAgentId,
  tenantGroupId: group.id,
  channel: AuditChannel.ADMIN_PORTAL,
});
```

---

## Sequence numbers

`sequenceNo` is monotonic per tenant (per `tenantGroupId`). Global events use `tenantGroupId: null` and share a global sequence. Use `sequenceNo` for ordering and idempotency hints when replaying.
