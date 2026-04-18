# Ledger module (VillageCircle360 UK MVP)

Append-only, event-linked accounting-lite core. No contribution business logic here; this is a reusable ledger engine.

## Amount convention

- **Signed `amountMinor`**: positive = **credit**, negative = **debit** (standard for asset buckets like SAVINGS).
- All amounts are in **minor units** (e.g. pence for GBP). `currencyCode` on each line (default `GBP`).

## Fund buckets

- `SAVINGS`, `SOCIAL_FUND`, `LOAN_PRINCIPAL`, `LOAN_INTEREST`, `PENALTY`, `WAIVER_ADJUSTMENT`.
- **SOCIAL_FUND is never merged with SAVINGS** in default totals or reporting. Balance and group-total APIs support optional bucket filter; each bucket is always reported separately.

## Idempotency

When `idempotencyKey` is provided on a posting command, a second request with the same key returns the existing event id and does not create duplicate events.

## Reversals

Reversals do **not** mutate the original event or lines. A new `LedgerEvent` is created with `reversalOfLedgerEventId` set to the original; new `LedgerLine` rows have the opposite sign of `amountMinor`. Original records remain unchanged.

## Audit

Each successful post and each reversal emits an audit log entry (`LEDGER_POSTED`, `LEDGER_REVERSED`) via `AuditLogService`.
