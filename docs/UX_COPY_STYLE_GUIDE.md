# VillageCircle360 UX copy style guide and content architecture (UK MVP/V1)

UK English, i18n-ready, trust-first. Covers UX writing style, terminology, copy key structure, content governance, variable conventions, and risky-wording guardrails.

**References:** `frontend/lib/copy/` (keys, messages), `frontend/lib/brand/do-not-say.ts`, `frontend/docs/BRAND_MVP_MODULE_COPY.md`.

---

## 1. UX writing style guide (UK English)

### Tone

- **Clear:** Short sentences; one idea per sentence where possible.
- **Respectful:** “You” and “your” are fine; avoid “we” where it could imply the platform does something it does not (e.g. “we pay”).
- **Practical:** Focus on what the user can do and what happened; avoid marketing fluff in flows.
- **Trust-first:** Be accurate. For MVP, emphasise “recorded”, “tracked”, “record” so users understand the app records activity and does not hold or move money.

### Grammar and punctuation

- **UK English:** “colour”, “organisation”, “centre”, “recorded”, “cancelled”, “authorise”.
- **Oxford comma:** Use in lists of three or more where it aids clarity.
- **Contractions:** Allowed where they sound natural (“don’t”, “can’t”, “you’ll”). Avoid in legal or high-stakes copy.
- **Ampersands:** Avoid in body copy; use “and”. Allowed in short UI labels if space is tight (e.g. “Terms & privacy”).
- **Ellipsis:** Use single character (…) for trailing or loading states, not three full stops.

### Sentence length

- **Target:** Most sentences under 20 words; avoid run-ons.
- **Errors and confirmations:** Prefer one short sentence for the main message; second sentence only if needed for action or reason.
- **Helper text:** One or two short sentences; use a bullet list for multiple conditions.

### Button label style

- **Verbs or verb phrases:** Start with an action: “Save”, “Record repayment”, “Reverse”, “Try again”.
- **Length:** Prefer one or two words; three words acceptable when needed (“Record repayment”, “Start support access”).
- **Casing:** Sentence case: “Try again”, not “Try Again”.
- **Destructive actions:** Be explicit: “Reverse contribution”, “Cancel”, not “Submit” for reversals.

**Examples (from COPY_KEYS):**

| Key | Label |
|-----|--------|
| common_button_retry | Try again |
| common_button_confirm | Confirm |
| ops_contribution_reverse | Reverse |
| ops_loan_repay_record | Record repayment |
| admin_support_gate_startAccess | Start support access |

### Error message style

- **What happened:** State the outcome in plain language (“Could not load statements.”).
- **Action:** Offer a single next step when useful (“Please try again.” / “Try again” button).
- **Tone:** Neutral; avoid blame or “Error:” prefix unless required by pattern.
- **Technical detail:** Do not expose stack traces or internal codes to users; log those server-side.

**Examples:**

| Context | Example |
|---------|--------|
| Load failure | Could not load statements. |
| Generic | Something went wrong |
| With retry | Could not load your summary. Please try again. |

### Confirmation dialog style

- **Title:** Short, action-oriented (“Reverse contribution”, “Confirm”).
- **Body:** One or two sentences explaining effect and, if relevant, irreversibility.
- **Buttons:** Primary = confirming action (e.g. “Reverse contribution”); secondary = “Cancel”. Label the action, not “OK”.
- **Reversals:** Use immutable copy (e.g. “Reversing creates a reversing ledger entry and an audit record. The original record remains visible but marked reversed. History is preserved for audit.”).

### Warning and legal copy style

- **Warnings:** Clear and specific. Avoid “Warning:” prefix unless required; prefer a short statement (“Financial corrections must use reversal or adjustment workflows. This screen is read-only.”).
- **Legal:** Separate from marketing. Use full product name “VillageCircle360” where the contract or notice refers to the platform. Do not substitute module names (VC Save, etc.) for the legal entity. Keep sentences complete and unambiguous; avoid colloquialisms in terms and privacy.

---

## 2. Product terminology glossary (MVP)

Preferred terms for consistent UX and i18n. Use these in copy keys and default messages.

| Term | Definition | Use in UI |
|------|------------|-----------|
| **Contribution** | A recorded record of a member paying in (savings/group payment). MVP: record only; money is not moved by the app. | “Contribution”, “contribution record”, “Record contribution” |
| **Repayment** | A recorded record of a member repaying toward a group-managed loan. MVP: record only. | “Repayment”, “Record repayment”, “Repayment recorded” |
| **Loan record** | The application and lifecycle record of a group-managed loan (application, approval, disbursement recorded, repayments). Not platform lending. | “Loan record”, “loan application”, “Approval record” |
| **External transfer reference** | A reference (e.g. bank ref, receipt number) for a payment or transfer made outside the app, recorded for audit. | “External reference”, “Payment reference (external)” |
| **Evidence** | Document or attachment linked to a record (e.g. receipt, proof of payment) for audit. | “Evidence”, “Evidence attached”, “View evidence” |
| **Reversal** | A correcting record that reverses a prior contribution (or similar); original record remains visible, history preserved. | “Reversal”, “Reverse”, “Reversal record”, “Reversed” |
| **Audit trail** | Immutable log of actions and events for compliance and support. | “Audit trail”, “History is preserved for audit”, “View trace” |
| **Group rules** | Rules and policies set by the group (e.g. savings rules, loan rules), not by the platform. | “Group rules”, “According to group rules” |
| **Share-out** | Distribution or payout decided by the group (e.g. from pooled savings). MVP: workflow/record only. | “Share-out”, “Share-out record” |

**Avoid in MVP:** “Payment sent”, “We transferred”, “Wallet”, “Bank account” (unless the feature exists), “Lending by the platform”, “Guaranteed”.

---

## 3. Prohibited / avoid wording (MVP perimeter safety)

Do not imply that the platform sends or holds money when it only records. Use the approved alternatives below. Machine-readable list: `frontend/lib/brand/do-not-say.ts`.

### Avoid → Use instead

| Avoid | Reason | Use instead |
|-------|--------|-------------|
| Bank transfer sent by VC / Payment sent by VillageCircle | Implies platform executes payments | “Payment recorded (external)”, “Record bank transfer” |
| VC holds funds / VillageCircle holds your money | Platform does not hold funds in MVP | “Amounts are recorded in the system. The app does not hold funds.” |
| We pay / We transfer / Transfer sent | Implies platform executes | “Record payment”, “Payment recorded (made outside the app)” |
| Bank account / Wallet | Not implemented in MVP | “Record of amount”, “Savings total (recorded)” unless feature exists |
| Lending by the platform / Platform is a lender | No regulated lending by platform | “Loan record”, “Group-managed loan”, “Application recorded” |
| Guarantee / Guaranteed return | No guaranteed outcomes | Rephrase (e.g. “subject to group rules”) |
| Investment through VC | No investment product | “Savings record”, “Contribution record” |
| E-money issued by | No e-money issuance | “Record of amount”, “Recorded balance” |
| VC Pay is available / VC Learn is live | Later modules | “VC Pay – Coming in a later release” |

**Check:** Run the copy lint script so all `messages` values are checked against `findDoNotSayViolation()` (see Testing/checks below).

---

## 4. Copy key architecture (i18n/localization readiness)

Copy lives in `frontend/lib/copy/`: `keys.ts` (constants), `messages.ts` (UK English defaults). Use `getCopy(key)` and, for templated strings, `getCopyTemplate(key, vars)`.

### Namespace mapping (key prefix → module)

| Namespace | Key prefix | Scope |
|-----------|------------|--------|
| **common.*** | common_ | Buttons, loading, empty states, generic errors |
| **auth.*** | auth_ | Login, session, sign-out (add when needed) |
| **vcSave.*** | member_ (dashboard, statements), ops_ (meeting entry, contribution) | Member savings view; recording contributions |
| **vcHub.*** | ops_ (meetings, governance), member_ | Meetings, governance, share-out (when present) |
| **vcGrow.*** | grow_, ops_ (loan approve, repay) | Loan application, approval, repayment records |
| **notifications.*** | notifications_ | Preferences, channels, SMS copy |
| **adminSupport.*** | admin_ | Support gate, traces, evidence, audited view |
| **legal.*** | legal_ | Terms, privacy, footer (add when needed) |
| **errors.*** | common_error_*, *_errorLoad, etc. | All user-facing error messages |

Current keys follow `area_context_element` (e.g. `common_button_retry`, `member_dashboard_savingsTotal`). For i18n, namespaces can be split into JSON per module (e.g. `common.en.json`, `vcSave.en.json`) with the same key structure.

### Key structure rules

- **Pattern:** `{namespace}_{context}_{element}` or `{namespace}_{screen}_{element}`.
- **No duplicate keys:** Each key must appear once in `COPY_KEYS` and once in `messages`.
- **Trivial exceptions:** Truly trivial, non-reused strings (e.g. a single “×” in a shared component) may stay in code; everything else goes through copy keys.

---

## 5. Variable conventions and formatting tokens

Use placeholders in message strings and pass values via `getCopyTemplate(key, vars)` so formatting is consistent and i18n-safe.

### Standard placeholders

| Placeholder | Meaning | Example value |
|-------------|---------|----------------|
| `{amount}` | Formatted currency (e.g. GBP) | “£20.00” |
| `{groupName}` | Name of the group/circle | “Tuesday Circle” |
| `{dueDate}` | Formatted date (UK) | “15 Mar 2025” |
| `{transactionMode}` | Cash / Bank transfer | “Cash” |
| `{actorName}` | User or system that performed the action | “Jane (Treasurer)” |
| `{recordType}` | Contribution / Repayment / Loan | “Contribution” |
| `{reason}` | Reversal or audit reason | “Duplicate entry” |

### Formatting rules

- **Currency:** Format with `frontend/lib/format/currency` (e.g. `formatGBP`) before passing as `{amount}`; do not embed raw numbers in copy.
- **Dates:** UK format (e.g. DD MMM YYYY); use `frontend/lib/format/date` (e.g. `formatUKDate`).
- **Names:** Sanitise and truncate if needed; never render unsanitised HTML from variables.

### Example templated copy

- “{amount} recorded for {groupName}.” → `common_exampleRecordSummary` (use `getCopyTemplate(COPY_KEYS.common_exampleRecordSummary, { amount, groupName })`).
- “Repayment of {amount} recorded. Due date was {dueDate}.” — add key when needed.
- “Reversal reason: {reason}. History is preserved for audit.” — add key when needed.

Implementation: `frontend/lib/copy/messages.ts` — `getCopyTemplate(key, vars)`.

---

## 6. Content governance rules

1. **No hardcoded user-facing strings in feature components** (except trivial cases like “×” or a single repeated symbol). Use `getCopy(COPY_KEYS.*)` or `getCopyTemplate(COPY_KEYS.*, vars)`.
2. **Copy changes are tracked centrally:** All default copy lives in `frontend/lib/copy/messages.ts`; key additions in `keys.ts`. No ad hoc strings in pages or components for labels, errors, or confirmations.
3. **Legal copy is separate from marketing:** Legal pages (terms, privacy) use dedicated keys (e.g. `legal_*`) and must not be mixed with marketing or in-app promotional copy. Use “VillageCircle360” as the product/legal name where the contract refers to the platform.
4. **Risky wording:** All new or changed copy should be checked against `frontend/lib/brand/do-not-say.ts` (run `npm run copy:check`).
5. **Glossary alignment:** Prefer terms from the Product terminology glossary in new copy; avoid prohibited wording.

---

## 7. Examples

### Button labels

- Back, Cancel, Confirm, Try again, Submit → `common_button_*`
- Reverse → `ops_contribution_reverse`
- Record repayment → `ops_loan_repay_record`
- Start support access → `admin_support_gate_startAccess`

### Helper text

- “Reason (required)” → `ops_contribution_reversalReasonRequired`
- “Amounts shown are recorded in the system. This app does not hold or move funds.” → `member_mvp_disclaimer`
- “This records a contribution received outside the app. The app does not process or hold funds.” → `ops_mvp_recorded_not_executed`

### Error messages

- “Something went wrong” → `common_error_generic`
- “Could not load statements.” → `member_statements_errorLoad`
- “Could not load your summary. Please try again.” → `member_dashboard_errorLoad`

### Reversal explanations

- Dialog body: “Reversing creates a reversing ledger entry and an audit record. The original record remains visible but marked reversed. History is preserved for audit.” → `immutable_reversalExplanation`
- Reversed record banner: “This record has been reversed. History is preserved for audit.” → `immutable_recordReversedMessage`

### Permission denied messages

- Use a single, respectful line (e.g. “You don’t have permission to perform this action.”). Prefer a shared key such as `common_permissionDenied` (add to COPY_KEYS when implemented) and use it from permission-denied components.

---

## 8. Testing and checks

- **Copy key coverage:** `frontend/__tests__/lib/copy/messages.test.ts` — every `COPY_KEYS` key has a non-empty string in `messages`.
- **Copy key lint/check script:** `npm run copy:check` (see below) — checks (1) every key has a message, (2) no duplicate keys, (3) all message values run through `findDoNotSayViolation()` and fail if any violation is found.
- **Glossary consistency:** The same script can optionally flag messages that contain prohibited wording; approved terminology is encouraged in review. Manual review for “contribution”, “repayment”, “loan record”, “reversal”, “audit trail” usage is recommended for new copy.

Implementations:

- **Script:** Run `npm run copy:check` in `frontend/`. It runs Jest tests in `__tests__/lib/copy/`: (1) every `COPY_KEYS` key has a non-empty message, (2) no duplicate key string values, (3) every message passes `findDoNotSayViolation()` from `lib/brand/do-not-say.ts`. Failures list missing keys, duplicates, or prohibited wording.
- **Glossary consistency:** Manually prefer terms from § Product terminology glossary when adding copy; the do-not-say test catches prohibited phrasing automatically.
