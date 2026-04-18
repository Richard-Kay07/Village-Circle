# Group rules (loan and config)

Versioned rule set per group with **effective dating**. Loan approval and schedule generation must use a **rule snapshot** (immutable object), not live rule rows. Historical loans do not change when rules are edited later.

## Interest rate: basis points (bps)

- **loanInterestRateBps**: stored as integer. **100 bps = 1%**, e.g. 500 = 5%.
- Avoids decimal rounding; standard in finance. Conversion: `percent = rateBps / 100`.

## Loan interest basis (MVP)

- **FLAT**: interest calculated on initial principal only (e.g. total interest = principal × rate × term).
- **SIMPLE_DECLINING**: optional; interest on declining balance (implement when schedule generation supports it).

## Versioning

- **Create** adds the first or a new version with `effectiveFrom = now`. Any current version (where `effectiveTo` is null) gets `effectiveTo = now`.
- **Update** always creates a new version; it never overwrites. Previous version is closed with `effectiveTo = now`.
- Effective at date: version where `effectiveFrom <= atDate` and (`effectiveTo` is null or `effectiveTo > atDate`), ordered by `effectiveFrom` desc.

## Snapshot for loans

- `getSnapshotForLoan(groupId, atDate)` returns a **LoanRuleSnapshot** (plain object) for use at approval/disbursement. Store `ruleVersionId` on the loan if you need to re-resolve the snapshot later (e.g. for reschedule workflow).
- Penalty and social fund fields are placeholders; structure can be extended when those features are implemented.

## RBAC and audit

- Create/update require **GROUP_MANAGE_RULES**.
- Every create and update emits an audit log entry (**RULE_VERSION_CREATED**, **RULE_VERSION_UPDATED**) with before/after snapshots.
