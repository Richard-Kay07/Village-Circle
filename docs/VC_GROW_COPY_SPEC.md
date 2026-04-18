# VC Grow (MVP) – UX copy spec

Core UX copy for VC Grow in VillageCircle360 UK MVP/V1. Scope: micro-loan records and workflows, approvals, disbursement records (external transaction records), repayments and schedules, credit/contribution history support. **No regulated lending by the platform.**

**References:** `frontend/lib/copy/` (keys, messages), `docs/UX_COPY_STYLE_GUIDE.md`, `frontend/lib/brand/do-not-say.ts`.

---

## 1. VC Grow scope in MVP

- **Micro-loan records and workflows** – Applications, approvals, loan records.
- **Disbursement records** – Record of external disbursement (platform does not execute).
- **Repayments and schedules** – Recording repayments; allocation order (penalties → interest → principal).
- **Credit history / contribution history support** – Where implemented; records only.
- **No platform lending** – Wording must state the platform records and tracks for the group; the group (not the platform) is the lender unless explicitly stated otherwise.

---

## 2. Copy dictionary and usage

### 2.1 Dashboard and perimeter

| Key | Content | Usage |
|-----|---------|--------|
| grow_dashboard_card_title | VC Grow | Module card title |
| grow_dashboard_card_description | Loan records, approvals and repayment tracking. Credit history records only. No regulated lending by the platform. | Card body |
| grow_mvp_perimeter | The platform records and tracks loan activity for your group. It does not provide or execute lending. | Perimeter disclaimer |
| grow_mvp_loan_disclaimer | Loans are managed by your group. This app records applications and repayments; it does not provide or execute lending. | Member-facing disclaimer |

### 2.2 Loan application (member request)

| Key | Content | Usage |
|-----|---------|--------|
| grow_loan_request_title | Request a loan | Page title |
| grow_loan_request_backToLoans | Back to My Loans | Back link |
| grow_loan_request_groupPolicyHeading | Group policy | Policy hint heading |
| grow_interest_enabled | Yes | Rule snapshot: interest on (boolean) |
| grow_interest_disabled | No | Rule snapshot: interest off (boolean) |
| grow_interest_mayApply | Interest may apply ({rate}% rate). Terms set at approval. | getCopyTemplate(KEY, { rate }) when interest enabled |
| grow_interest_doesNotApply | Interest does not apply for loans in this group. | When interest disabled |
| grow_loan_request_amountLabel | Requested amount (£) | Form label |
| grow_loan_request_termLabel | Requested term (number of periods) | Form label |
| grow_loan_request_termPlaceholder | e.g. 12 | Placeholder |
| grow_loan_request_termErrorRequired | Term is required | Validation |
| grow_loan_request_termErrorInvalid | Enter a whole number of periods (at least 1) | Validation |
| grow_loan_request_purposeLabel | Purpose or note (optional) | Form label |
| grow_loan_request_purposePlaceholder | e.g. Home repair | Placeholder |
| grow_loan_request_continue | Continue | Button |
| grow_loan_request_confirmHeading | Confirm your application | Confirm step heading |
| grow_loan_request_submit | Submit application | Button |
| grow_loan_request_submitting | Submitting… | Button state |

### 2.3 Approval and rule snapshot

| Key | Content | Usage |
|-----|---------|--------|
| grow_ruleSnapshot_heading | Current group rules (if you approve) | Section heading |
| grow_ruleSnapshot_interestLabel | Interest | Label before Yes/No or rate |
| grow_ruleSnapshot_termLabel | Term | Label |

Use `grow_interest_enabled` / `grow_interest_disabled` (or `grow_loan_detail_interestEnabled` / `grow_loan_detail_interestDisabled`) for interest on/off from booleans.

### 2.4 Repayment form and allocation

| Key | Content | Usage |
|-----|---------|--------|
| grow_repay_title | Record repayment | Page title |
| grow_repay_backToLoan | Back to Loan | Back link |
| grow_repay_loanSummaryHeading | Loan summary | Section heading |
| grow_repay_outstandingLabel | Outstanding | Label |
| grow_repay_allocationOrderExplainer | Repayments are applied in this order: penalties first, then interest, then principal. | MVP deterministic rule explainer |
| grow_repay_duplicateMessage | This repayment was already recorded with the same idempotency key. No duplicate has been created. | Idempotency-safe duplicate message |
| grow_repay_success | Repayment recorded successfully. | Success banner |
| grow_repay_allocatedPrincipal | principal | Allocation line (with amount) |
| grow_repay_allocatedInterest | interest | Allocation line |
| grow_repay_allocatedPenalty | penalty | Allocation line |
| grow_repay_evidenceLinkedNote | Evidence is linked to this record and cannot be changed. | After submit |
| grow_repay_amountLabel | Amount (£) | Form label |
| grow_repay_transactionModeRequired | Transaction mode is required. | Validation |
| grow_repay_recording | Recording… | Button state |
| grow_repay_recordButton | Record repayment | Button (full) |
| grow_repay_recordButtonShort | Record repay | Button (mobile short) |
| grow_repay_loanNotActive | This loan is not active. Repayments can only be recorded for active loans. | Block message |
| grow_repay_noOutstanding | This loan has no outstanding amount. | Block message |
| grow_repay_errorLoadLoan | Could not load loan. | Error state |

### 2.5 Loan detail, schedule and history

| Key | Content | Usage |
|-----|---------|--------|
| grow_loan_detail_title | Loan | Page title |
| grow_loan_detail_backToActive | Back to Active Loans | Back link |
| grow_loan_detail_loanStateHeading | Loan state | Section heading |
| grow_loan_detail_principalLabel | Principal | Label |
| grow_loan_detail_totalRepaidLabel | Total repaid | Label |
| grow_loan_detail_outstandingLabel | Outstanding | Label |
| grow_loan_detail_ruleSnapshotHeading | Rule snapshot | Section heading |
| grow_loan_detail_interestEnabled | Enabled | Interest on (detail view) |
| grow_loan_detail_interestDisabled | Disabled | Interest off (detail view) |
| grow_loan_detail_scheduleHeading | Schedule | Section heading |
| grow_loan_detail_scheduleEmptyDescription | Schedule will appear after disbursement. | Empty schedule |
| grow_loan_detail_scheduleConfidenceNote | Schedule and repayment history are recorded for audit. Subject to group rules and any reschedule or waiver. | Confidence-building; no guarantee |
| grow_loan_detail_exceptionHistoryHeading | Exception history | Section heading |
| grow_loan_detail_repaymentHistoryHeading | Repayment history | Section heading |
| grow_loan_detail_noRepaymentsYet | No repayments yet | Empty title |
| grow_loan_detail_noRepaymentsDescription | Record a repayment to update the schedule. | Empty description |
| grow_loan_detail_errorLoadLoan | Could not load loan. | Error state |

### 2.6 Exceptions (waiver, reschedule, write-off)

| Key | Content | Usage |
|-----|---------|--------|
| grow_loan_detail_actionsHeading | Actions | Section heading |
| grow_loan_detail_recordWaiver | Record waiver | Button |
| grow_loan_detail_reschedule | Reschedule | Button |
| grow_loan_detail_writeOff | Write off | Button |
| grow_loan_detail_recordRepaymentLink | Record repayment | Link |
| grow_loan_detail_waiverRecorded | Waiver recorded. | Success message |
| grow_loan_detail_rescheduleRecorded | Reschedule recorded. Prior schedule superseded. | Success message |
| grow_loan_detail_writeOffRecorded | Write-off recorded. | Success message |
| grow_loan_detail_waiverDialogTitle | Record waiver | Dialog title |
| grow_loan_detail_waiverDialogBody | Reason is required. This will create an audit record. | Dialog body |
| grow_loan_detail_rescheduleDialogTitle | Reschedule loan | Dialog title |
| grow_loan_detail_rescheduleDialogBody | Prior schedule will be superseded. Reason and new terms required. | Dialog body |
| grow_loan_detail_writeOffDialogTitle | Write off loan | Dialog title |
| grow_loan_detail_writeOffDialogBody | Reason is required. This action may be restricted by the backend. | Dialog body |

### 2.7 Overdue and notifications

| Key | Content | Usage |
|-----|---------|--------|
| grow_overdue_reminderNote | Overdue amounts may attract penalties under group rules. Record repayments to update the schedule. | Linked to notifications / overdue UI |

---

## 3. Interest on/off from booleans

- **Snapshot / detail:** Use `getCopy(COPY_KEYS.grow_loan_detail_interestEnabled)` when `interestEnabled === true`, else `getCopy(COPY_KEYS.grow_loan_detail_interestDisabled)`.
- **Member policy hint:** When `loanInterestEnabled` is true, use `getCopyTemplate(COPY_KEYS.grow_interest_mayApply, { rate: (rateBps/100).toFixed(2) })`. When false, use `getCopy(COPY_KEYS.grow_interest_doesNotApply)`.

---

## 4. Perimeter-safe wording

- Use **“platform records and tracks”** / **“app records”**; avoid “we lend”, “platform lends”, “we disburse” unless the group context explicitly states the group is lending.
- Prefer **“loan record”**, **“repayment recorded”**, **“disbursement recorded”** (record of an external transaction).

---

## 5. Confidence-building (no guarantees)

- **Schedule / history:** `grow_loan_detail_scheduleConfidenceNote` – “Schedule and repayment history are recorded for audit. Subject to group rules and any reschedule or waiver.”
- Do not promise outcomes (e.g. “your schedule will never change”); do state that data is recorded for audit.

---

## 6. Mobile-short labels

| Context | Full | Short |
|---------|------|--------|
| Record repayment button | Record repayment | Record repay (`grow_repay_recordButtonShort`) |

---

## 7. Testing and checks

- **Interest on/off:** Test that `grow_interest_enabled` / `grow_interest_disabled` (or detail variants) render correctly when given a boolean (e.g. true → “Yes”/“Enabled”, false → “No”/“Disabled”).
- **Prohibited wording:** Run `npm run copy:check`; all VC Grow messages must pass `findDoNotSayViolation()` (no “platform is the lender”, “we lend”, etc.).
