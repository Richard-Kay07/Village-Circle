# PR review checklist – design system & UX copy (MVP)

Use for PRs that touch UI, copy, tokens, or admin/support flows. Not every item applies to every PR.

## Tokens & styling

- [ ] New UI uses `tokens` from `@/lib/design-system/tokens` or `var(--vc-*)` – no arbitrary hex unless token gap is documented
- [ ] Module accents (Save / Hub / Grow) used consistently where product context is shown
- [ ] Touch targets ≥ 44px where interactive

## Copy

- [ ] User-facing strings come from `getCopy(COPY_KEYS.*)` or `getCopyTemplate` – not hardcoded (except tests/fixtures)
- [ ] Financial wording is recordkeeping-safe (record/reverse/approve; not “platform executed payment”)
- [ ] Run `npm run copy:check` in `frontend/` if `messages.ts` or copy keys changed

## Patterns

- [ ] Reversal flows use `ReverseRecordDialog` (or equivalent) + reason required where applicable
- [ ] Evidence after submit is locked; messaging matches evidence locked-state copy
- [ ] Admin/support views use reason-code gate or `AuditAccessReasonDialog` where tenant data is accessed

## Modules (VC Save / Hub / Grow)

- [ ] VC Save: contribution/meeting copy uses save_* or ops_* keys; transaction mode labels from copy
- [ ] VC Hub: approvals/governance warnings use hub_* keys; no implied platform guarantee
- [ ] VC Grow: loan/repayment/schedule uses grow_* keys; loan disclaimer where appropriate

## Docs

- [ ] If adding a new pattern, `frontend/docs/DESIGN_SYSTEM_MVP_GUIDE.md` or `TRUST_CRITICAL_COMPONENTS.md` updated if needed

## Optional

- [ ] Design-system preview route still renders if `app/design-system/*` changed (`/design-system/tokens`, etc.)
