# Contribution API – example payloads and evidence linkage

## Single contribution record

**POST** `/contributions`

- **RBAC**: `contribution.record` (GROUP_TREASURER or GROUP_CHAIR, or MEMBER for self).
- **Idempotency**: `idempotencyKey` is required. Duplicate key returns existing contribution and does not double-post to the ledger.

### Example 1: Cash, savings only

```json
{
  "tenantGroupId": "550e8400-e29b-41d4-a716-446655440000",
  "memberProfileId": "660e8400-e29b-41d4-a716-446655440001",
  "transactionMode": "CASH",
  "savingsAmountMinor": 2500,
  "socialFundAmountMinor": 0,
  "idempotencyKey": "meeting-2025-03-01-m1-cash",
  "recordedByUserId": "770e8400-e29b-41d4-a716-446655440002"
}
```

- `totalAmountMinor` is derived: 2500 (savings only).
- At least one of `savingsAmountMinor` or `socialFundAmountMinor` must be > 0.

### Example 2: Bank transfer, savings + social fund

```json
{
  "tenantGroupId": "550e8400-e29b-41d4-a716-446655440000",
  "meetingId": "880e8400-e29b-41d4-a716-446655440003",
  "memberProfileId": "660e8400-e29b-41d4-a716-446655440001",
  "transactionMode": "BANK_TRANSFER",
  "savingsAmountMinor": 5000,
  "socialFundAmountMinor": 500,
  "externalReferenceText": "Ref: BACs 01/03/2025",
  "idempotencyKey": "meeting-2025-03-01-m1-bank",
  "recordedByUserId": "770e8400-e29b-41d4-a716-446655440002"
}
```

- Ledger lines are posted to both SAVINGS and SOCIAL_FUND buckets; SOCIAL_FUND remains separate from SAVINGS in balances.

### Example 3: Text reference only

```json
{
  "tenantGroupId": "550e8400-e29b-41d4-a716-446655440000",
  "memberProfileId": "660e8400-e29b-41d4-a716-446655440001",
  "transactionMode": "CASH",
  "savingsAmountMinor": 1000,
  "socialFundAmountMinor": 0,
  "externalReferenceText": "Chq 123456",
  "idempotencyKey": "idem-text-only",
  "recordedByUserId": "770e8400-e29b-41d4-a716-446655440002"
}
```

### Example 4: Image evidence only

```json
{
  "tenantGroupId": "550e8400-e29b-41d4-a716-446655440000",
  "memberProfileId": "660e8400-e29b-41d4-a716-446655440001",
  "transactionMode": "CASH",
  "savingsAmountMinor": 1000,
  "socialFundAmountMinor": 0,
  "evidenceAttachmentId": "990e8400-e29b-41d4-a716-446655440004",
  "idempotencyKey": "idem-image-only",
  "recordedByUserId": "770e8400-e29b-41d4-a716-446655440002"
}
```

- `evidenceAttachmentId` must be the id of an **EvidenceFile** that belongs to the same `tenantGroupId` (group). The file is registered via the Evidence module (e.g. upload then register); contribution only stores the id.

### Example 5: Both text reference and image

```json
{
  "tenantGroupId": "550e8400-e29b-41d4-a716-446655440000",
  "memberProfileId": "660e8400-e29b-41d4-a716-446655440001",
  "transactionMode": "BANK_TRANSFER",
  "savingsAmountMinor": 3000,
  "socialFundAmountMinor": 200,
  "externalReferenceText": "Transfer ref XYZ",
  "evidenceAttachmentId": "990e8400-e29b-41d4-a716-446655440004",
  "idempotencyKey": "idem-both",
  "recordedByUserId": "770e8400-e29b-41d4-a716-446655440002"
}
```

---

## Bulk meeting contribution entry

**POST** `/contributions/bulk`

- **RBAC**: `contribution.record`.
- Each item has its own `idempotencyKey`; duplicates per key return existing and do not double-post.

### Example: Mixed-mode meeting

```json
{
  "tenantGroupId": "550e8400-e29b-41d4-a716-446655440000",
  "meetingId": "880e8400-e29b-41d4-a716-446655440003",
  "recordedByUserId": "770e8400-e29b-41d4-a716-446655440002",
  "contributions": [
    {
      "memberProfileId": "660e8400-e29b-41d4-a716-446655440001",
      "transactionMode": "CASH",
      "savingsAmountMinor": 2000,
      "socialFundAmountMinor": 0,
      "externalReferenceText": "Cash collected",
      "idempotencyKey": "mtg-1-m1"
    },
    {
      "memberProfileId": "660e8400-e29b-41d4-a716-446655440002",
      "transactionMode": "BANK_TRANSFER",
      "savingsAmountMinor": 5000,
      "socialFundAmountMinor": 500,
      "externalReferenceText": "BACs ref",
      "evidenceAttachmentId": "990e8400-e29b-41d4-a716-446655440004",
      "idempotencyKey": "mtg-1-m2"
    }
  ]
}
```

Response: `{ "recorded": 2, "ids": ["cid-1", "cid-2"] }`.

---

## Reversal

**POST** `/contributions/reversal`

- **RBAC**: `contribution.reverse` (elevated: Treasurer and/or Chair).
- No destructive edit: contribution status set to REVERSED, reversing ledger event created, original evidence linkage preserved.

```json
{
  "tenantGroupId": "550e8400-e29b-41d4-a716-446655440000",
  "contributionId": "a1b2c3d4-e29b-41d4-a716-446655440099",
  "reversalReason": "Duplicate entry corrected",
  "reversedByUserId": "770e8400-e29b-41d4-a716-446655440002"
}
```

---

## Contribution detail (with evidence metadata)

**GET** `/contributions/:contributionId?tenantGroupId=...`

- Returns contribution with `evidenceAttachmentId` (and `externalReferenceText`). Use `evidenceAttachmentId` with the Evidence API to resolve file metadata (e.g. `GET /evidence/:id`) when present.

---

## Read models and reconciliation queries

All read endpoints require **CONTRIBUTION_RECORD** unless noted. Sensitive field **externalReferenceText** is only returned when the caller has **REPORT_EXPORT** or **AUDIT_READ**.

- **GET** `/contributions/meeting/:meetingId/summary?tenantGroupId=...` — Meeting contribution summary: totals by mode (CASH / BANK_TRANSFER), SAVINGS and SOCIAL_FUND reported separately, plus contribution rows with evidence presence and ledger ids. Optional query: `dateFrom`, `dateTo`, `transactionMode`, `fundBucket`, `status`, `actorUserId`, `actorMemberId`.

- **GET** `/contributions/member/:memberId/history?tenantGroupId=...` — Member contribution history with same filters. Totals per member with SAVINGS and SOCIAL_FUND separate.

- **GET** `/contributions/reports/unreconciled-bank-transfers?tenantGroupId=...` — **Requires REPORT_EXPORT.** Unreconciled bank-transfer contributions (RECORDED, BANK_TRANSFER). Emits audit event `CONTRIBUTION_REPORT_READ` for export-style read. Optional filters: `dateFrom`, `dateTo`, `fundBucket`, etc.

- **GET** `/contributions/reports/cash-totals?tenantGroupId=...&groupBy=meeting|date` — Cash contribution totals grouped by meeting or by date. SOCIAL_FUND and SAVINGS reported separately per group.

---

## Evidence linkage and validation

- **evidenceAttachmentId** in the API is stored as **evidenceFileId** on the Contribution model and links to **EvidenceFile** (same group).
- Validation: when `evidenceAttachmentId` is provided, the service checks that an EvidenceFile with that id exists and has `groupId === tenantGroupId`. If not, **EvidenceNotFoundOrWrongGroupError** is thrown.
- Evidence can be:
  - **Text only**: `externalReferenceText` set, `evidenceAttachmentId` omitted.
  - **Image only**: `evidenceAttachmentId` set (after registering the file via Evidence module), `externalReferenceText` optional.
  - **Both**: both set.
- Ledger event metadata stores `externalReferenceText` and `evidenceAttachmentId` for audit; the contribution record keeps the same for read/detail.
