# Loan engine (VillageCircle360 UK MVP)

Application, approval (with rule snapshot), schedule generation, disbursement and repayment recording. Interest is configurable by group via rule snapshot at approval time; rule changes after approval do not change existing loan schedules.

## Repayment allocation order (MVP)

**Order: penalty first, then interest, then principal.**

Applied in installment order (earliest due first). Outstanding per schedule item = due − paid. Each repayment is allocated across DUE/PART_PAID items until the payment amount is exhausted.

## Ledger design

- **Disbursement**: One event `LOAN_DISBURSEMENT_RECORDED`. Lines: credit member LOAN_PRINCIPAL (+principalMinor), debit group-level LOAN_PRINCIPAL (−principalMinor). Double-entry balanced.
- **Repayment**: One event `LOAN_REPAYMENT_RECORDED`. Lines: debit member LOAN_PRINCIPAL / LOAN_INTEREST / PENALTY (negative), credit group-level (positive) for each bucket with a non-zero allocation. transactionMode and evidence refs in event metadata.

## Sample API payloads

### Submit application

**POST** `/loans/applications`

```json
{
  "tenantGroupId": "550e8400-e29b-41d4-a716-446655440000",
  "memberProfileId": "660e8400-e29b-41d4-a716-446655440001",
  "requestedAmountMinor": 100000,
  "requestedTermPeriods": 12,
  "purpose": "Business stock",
  "submittedByUserId": "770e8400-e29b-41d4-a716-446655440002",
  "actorUserId": "770e8400-e29b-41d4-a716-446655440002"
}
```

### Approve application

**POST** `/loans/applications/approve`

```json
{
  "applicationId": "<from submit response>",
  "tenantGroupId": "550e8400-e29b-41d4-a716-446655440000",
  "approvedByUserId": "770e8400-e29b-41d4-a716-446655440002",
  "actorUserId": "770e8400-e29b-41d4-a716-446655440002"
}
```

Creates the Loan and schedule from the **rule snapshot at approval time**. If group has interest disabled, schedule has zero interest.

### Record disbursement

**POST** `/loans/disbursements`

```json
{
  "loanId": "<from approve response>",
  "tenantGroupId": "550e8400-e29b-41d4-a716-446655440000",
  "transactionMode": "CASH",
  "externalReferenceText": "Cash handover ref 123",
  "recordedByUserId": "770e8400-e29b-41d4-a716-446655440002",
  "actorUserId": "770e8400-e29b-41d4-a716-446655440002"
}
```

With image evidence:

```json
{
  "loanId": "<loanId>",
  "tenantGroupId": "550e8400-e29b-41d4-a716-446655440000",
  "transactionMode": "BANK_TRANSFER",
  "evidenceAttachmentId": "990e8400-e29b-41d4-a716-446655440004",
  "recordedByUserId": "770e8400-e29b-41d4-a716-446655440002"
}
```

### Record repayment

**POST** `/loans/repayments`

```json
{
  "loanId": "<loanId>",
  "tenantGroupId": "550e8400-e29b-41d4-a716-446655440000",
  "transactionMode": "BANK_TRANSFER",
  "amountMinor": 10000,
  "externalReferenceText": "BACs 01/04/2025",
  "evidenceAttachmentId": "990e8400-e29b-41d4-a716-446655440004",
  "recordedByUserId": "770e8400-e29b-41d4-a716-446655440002",
  "idempotencyKey": "rep-2025-04-01-inst1",
  "actorUserId": "770e8400-e29b-41d4-a716-446655440002"
}
```

Idempotent by `idempotencyKey`; duplicate request returns existing repayment.

## RBAC

- `loan.apply` — submit application
- `loan.approve` — approve/reject application
- `loan.disbursement.record` — record disbursement
- `loan.repayment.record` — record repayment
- `loan.waive` — record waiver event (reason + approver required)
- `loan.reschedule` — record reschedule (prior schedule marked superseded; history preserved)
- `loan.writeoff` — write-off (MVP: skeleton only; capability checked then domain error until fully implemented)

## Exception events (waiver, reschedule, write-off)

Explicit event records; each requires **reason** and **approver identity**. Audit logged. Waiver: `LoanWaiverEvent` + optional schedule update. Reschedule: prior schedule items marked superseded (`supersededByRescheduleEventId`), new items created, history preserved. Write-off: skeleton—throws `LoanWriteOffNotImplementedError` until implemented. **POST** `/loans/waivers`, `/loans/reschedules`, `/loans/write-offs` with loanId, tenantGroupId, reason, approvedByUserId; reschedule also needs newTermPeriods, firstDueDate.
