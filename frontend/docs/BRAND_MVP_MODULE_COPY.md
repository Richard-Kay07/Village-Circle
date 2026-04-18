# MVP-safe module positioning copy

Defines how VC Save, VC Hub, and VC Grow are described in UI. MVP = software-only recordkeeping; no fund holding, payment execution, or regulated lending.

---

## VC Save (MVP)

- **Savings records:** Record of contributions and balances. No in-app money movement.
- **External payment / remittance tracking:** References to payments or remittances made outside the app; receipts and logs only.
- **Allowed wording:** "Recorded", "tracking", "receipt", "log of external transaction", "savings total (recorded)", "contribution record".
- **Do not imply:** That the app holds funds, sends payments, or executes remittances.

**Example:** "VC Save helps your group record savings and track payments made outside the app. The app does not hold or move funds."

---

## VC Hub (MVP)

- **Groups, governance, meetings, voting, share-out workflows.** Software-only recordkeeping and workflow.
- **Allowed wording:** "Meetings", "governance", "share-out", "voting", "group records", "recorded in the app".
- **Do not imply:** That "VC Hub" is a legal entity or contracting party. Legal obligations refer to the group or VillageCircle360.

**Example:** "VC Hub supports your group's governance, meetings and share-out. All activity is recorded in the app."

---

## VC Grow (MVP)

- **Loan records, approvals, repayment tracking, credit history records.** No regulated lending by the platform; group-managed loans only.
- **Allowed wording:** "Loan application (record)", "repayment recorded", "tracking", "approval record", "credit history record".
- **Do not imply:** That the platform is a lender, disburses funds, or executes lending.

**Example:** "VC Grow helps your group manage loan applications and repayment records. The platform records approvals and repayments; it does not provide or execute lending."

---

## Later modules (VC Pay, VC Learn)

- **VC Pay / VC Learn:** Visible only on roadmap and coming-soon surfaces unless feature-flagged.
- **Copy:** "VC Pay – Coming in a later release." "VC Learn – Coming in a later release."
- Do not imply current availability in main nav or dashboards.

---

## Do not say list

See `lib/brand/do-not-say.ts` for the full machine-readable list. Summary of avoided wording:

- "Bank transfer sent by VC" / "Payment sent by VillageCircle" (use: recorded / external)
- "VC holds funds" (use: amounts recorded; app does not hold funds)
- "We pay / we transfer" (use: record payment / payment recorded externally)
- "Lending by the platform" / "Platform is a lender" (use: loan record / group-managed loan)
- "Guarantee" / "Guaranteed return" (rephrase without guarantee)
- "Investment through VC" (use: savings record / contribution record)
- "E-money issued by" (use: record of amount)
- "VC Pay is available" / "VC Learn is live" (use: coming in a later release)

---

## Example UI label and copy snippets

Snippets are in `lib/brand/mvp-module-copy.ts`:

- **EXAMPLE_NAV_LABELS** – Member, treasurer, admin nav.
- **EXAMPLE_DASHBOARD_MODULE_CARDS** – Title + subtitle per module (Save, Hub, Grow).
- **EXAMPLE_ONBOARDING_MODULE_DESCRIPTIONS** – Heading + body per MVP module.
- **EXAMPLE_LEGAL_BRAND_USAGE** – Terms title, privacy title, footer, product reference (VillageCircle360, not module names).

Use COPY_KEYS and getCopy() in production where applicable; these examples show consistent naming and MVP-safe phrasing.
