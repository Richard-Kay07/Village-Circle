# Copy QA checklist – finance and admin surfaces (UK MVP/V1)

Human checklist for copy and wording on trust-critical flows. Use with automated checks: `npm run copy:check` (frontend).

## Automated checks (run first)

- [ ] **Copy key validation:** `npm run copy:check` in `frontend/` – no missing keys, no duplicates, no prohibited wording in messages.
- [ ] **Prohibited wording:** All entries in `lib/brand/do-not-say.ts` are applied to `lib/copy/messages.ts` by the test suite.

## Reversal flows

- [ ] **Contribution reversal:** Label says "Reverse" or "Reverse record", not "Edit payment" or "Change contribution".
- [ ] **Reversal reason:** Reason is required; explanation copy states that the original record remains visible and a reversal record is created.
- [ ] **Success message:** Uses immutable/reversal copy (e.g. "Reversal record created", "Original record preserved").
- [ ] **Loan waiver/reschedule/write-off:** Reason required; dialog body explains audit record / prior schedule superseded where relevant.

## Evidence copy

- [ ] **Before submit:** Optional evidence; helper text from copy keys (e.g. upload as proof of payment).
- [ ] **After submit (locked):** Copy explains evidence is linked and cannot be changed here; to correct, reverse and create a new record. No "Edit evidence" or "Update receipt".
- [ ] **VC Save / VC Grow:** Evidence labels and locked explanation use `save_evidence_*` or grow equivalents from copy keys.

## Loan approval, disbursement, repayment wording

- [ ] **Approval:** "Approve" / "Reject application"; no guarantee of disbursement; rule snapshot copy (interest, term) where shown.
- [ ] **Disbursement:** Wording is recordkeeping (e.g. "Loan created", "Disbursement recorded"); no "we have transferred" or platform-executed transfer.
- [ ] **Repayment:** "Record repayment"; allocation order explainer (penalties → interest → principal) where relevant; no "edit payment".
- [ ] **Overdue:** Reminder copy does not imply platform enforcement; refers to group rules.

## Admin support – trace and evidence access warnings

- [ ] **Support gate:** Case ID and reason code required; copy states access is logged for audit.
- [ ] **Evidence view (admin):** Banner states view is audited and case ID/reason logged; do not use for purposes other than stated support reason.
- [ ] **Failure states:** "Failed", "Retrying", "Undeliverable" (or equivalent) from copy keys for SMS delivery status in admin UI.

## Legal disclaimer placements

- [ ] **Perimeter:** Where financial totals or loan flows are shown, appropriate perimeter/disclaimer is present (e.g. "This app does not hold or move funds", "Platform records and tracks; does not provide or execute lending").
- [ ] **Legal keys:** Disclaimers use `legal_*` or module perimeter keys from `lib/copy`; no hardcoded legal paragraphs.
- [ ] **Onboarding / first use:** If signup or group creation shows legal copy, it uses `legal_onboarding_*` or equivalent.

## Prohibited wording (quick reference)

Do **not** use in user-facing copy unless the feature exists and is approved:

- Wording implying VC executes transfers when only recording (e.g. "payment sent by VC", "we transferred").
- "Edit payment" / "Edit contribution" / "Update payment" – use reversal + new record wording.
- "Bank account" / "wallet" (MVP does not implement).
- "Platform is the lender" / "lending by VC".
- Guarantees (e.g. "guaranteed approval").
- VC Pay / VC Learn as "available" or "live" (use "Coming in a later release").

Full list: `frontend/lib/brand/do-not-say.ts`. Run `npm run copy:check` to validate messages.

## Optional: scan UI code for prohibited phrases

To catch hardcoded strings that might contain prohibited wording, run from `frontend/`:

```bash
# Example: phrases that should not appear in user-facing copy
grep -rE "edit (payment|contribution|repayment)|bank account|wallet|payment sent by|we transferred" app components --include="*.tsx" --include="*.ts" || true
```

Manual review required for any matches (e.g. comments or test fixtures are OK).
