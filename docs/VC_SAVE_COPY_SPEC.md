# VC Save (MVP) – UX copy spec

Core UX copy for VC Save in VillageCircle360 UK MVP/V1. Scope: savings records, external payment/remittance reference tracking, receipts and contribution records. **No in-app money movement execution by the platform.**

**References:** `frontend/lib/copy/` (keys, messages), `docs/UX_COPY_STYLE_GUIDE.md`, `frontend/lib/brand/do-not-say.ts`.

---

## 1. VC Save scope (copy must reflect)

- **Savings records** – Contributions and balances recorded in the system.
- **External payment/remittance reference tracking** – References to payments or remittances made outside the app; receipts and logs only.
- **Receipts/logs and contribution records** – Evidence and text references; no execution.
- **No in-app money movement** – Wording must not imply the platform sends, holds, or moves funds.

Use **recording/tracking language only**: "recorded", "tracked", "record", "receipt", "log of external transaction". Avoid "pay", "transfer sent", "we hold" unless a future feature flag explicitly allows it.

---

## 2. Copy dictionary and usage

### 2.1 Dashboard card and perimeter

| Key | Full label | Narrow / short | Usage |
|-----|------------|----------------|-------|
| save_dashboard_card_title | VC Save | VC Save | Dashboard module card title |
| save_dashboard_card_description | Record savings and track external payments and remittances. Receipts and logs only; no in-app money movement. | — | Card body or onboarding |
| save_dashboard_card_description_short | Savings & statements. Records and receipts only. | Savings & statements | Card subtitle, nav |
| save_mvp_perimeter | Amounts shown are recorded in the system. This app does not hold or move funds. | — | Disclaimer on dashboard/statements |

### 2.2 Statement bucket labels (Savings vs Social Fund distinct)

| Key | Label | Usage |
|-----|--------|--------|
| save_bucket_savings | Savings | Statement line bucket; totals; never combine with social fund in one phrase |
| save_bucket_socialFund | Social fund | Statement line bucket; totals |
| save_bucket_loanPrincipal | Loan principal | Future loan breakdown |
| save_bucket_interest | Interest | Future loan breakdown |
| save_bucket_penalties | Penalties | Future loan breakdown |
| save_contribution_recordType | Contribution | Record type in statement list |

**Example statement line:** `"{date} · Savings {amount} · Social fund {amount}"` – always show savings and social fund as separate labels.

### 2.3 Transaction mode (mixed-mode entry)

| Key | Full label | Short (narrow mobile) | Usage |
|-----|------------|----------------------|--------|
| save_transactionMode_label | Transaction mode | Mode | Form label |
| save_transactionMode_cash | Cash | Cash | Radio / badge |
| save_transactionMode_cashShort | Cash | Cash | Badge short |
| save_transactionMode_bank | Bank transfer | Bank | Radio / badge |
| save_transactionMode_bankShort | Bank | Bank | Badge short |
| save_transactionMode_hint | How the payment was made outside the app. This record does not execute any transfer. | — | Helper under selector |

### 2.4 External reference (tracking only)

| Key | Content | Usage |
|-----|---------|--------|
| save_externalRef_placeholder | e.g. Bank ref: 123456 or Cash receipt #001 | Input placeholder |
| save_externalRef_hintBank | Bank transfer: use payment reference from your bank. | Helper for bank mode |
| save_externalRef_hintCash | Cash: use receipt number or brief note. | Helper for cash mode |

### 2.5 Evidence

| Key | Content | Usage |
|-----|---------|--------|
| save_evidence_label | Evidence | Field label |
| save_evidence_uploadHelper | Upload a photo or document as proof of payment. Optional; you can add evidence to the record later. | Above upload |
| save_evidence_lockedExplanation | Evidence is linked to this record and cannot be changed here. To correct evidence, reverse this record and create a new one with the right details. | When record submitted |
| save_evidence_optionalDetail | Evidence image: optional (attach via detail later) | Meeting entry row hint |

### 2.6 Batch review and totals (savings vs social fund separate)

| Key | Content | Usage |
|-----|---------|--------|
| save_batch_summaryTitle | Batch summary | Section heading |
| save_batch_savingsTotal | Savings total | Line label |
| save_batch_socialFundTotal | Social fund total | Line label |
| save_batch_totalCollected | Total collected | Line label |
| save_batch_cashCount | Cash | Count label (e.g. "Cash: 3") |
| save_batch_bankCount | Bank transfer | Count label |
| save_batch_willBeRecorded | {count} contribution(s) will be recorded. | getCopyTemplate(KEY, { count }) |
| save_batch_submitting | Submitting… | Button while submitting |
| save_contribution_success | Contributions recorded successfully. | Success banner after submit |
| save_reconciliation_heading | Recorded totals | Reconciliation-facing section |
| save_reconciliation_disclaimer | For reconciliation only. These are records of amounts received outside the app. | User-safe disclaimer |

### 2.7 Meeting entry (form and review)

| Key | Content | Usage |
|-----|---------|--------|
| ops_meeting_entry_title | Meeting entry | Page title |
| ops_meeting_entry_backToMeetings | Back to Meetings | Back link |
| ops_meeting_entry_helpText | Enter contributions per member. Use "Mark absent / zero" to skip. Total = Savings + Social fund. | Top of form |
| ops_meeting_entry_savingsLabel | Savings (£) | Currency input label |
| ops_meeting_entry_socialFundLabel | Social fund (£) | Currency input label |
| ops_meeting_entry_totalLabel | Total | Row total label |
| ops_meeting_entry_markAbsent | Mark absent / zero | Button |
| ops_meeting_entry_includeMember | Include member | Button when skipped |
| ops_meeting_entry_reviewSubmit | Review and submit | Primary CTA |
| ops_meeting_entry_submitBatch | Submit batch | Review step CTA |
| ops_meeting_entry_submitting | Submitting… | Button state |
| ops_meeting_entry_backToEntry | Back | Return to entry step |
| ops_meeting_entry_noMembersTitle | No members | Empty state title |
| ops_meeting_entry_noMembersDescription | Add members to the group first. | Empty state description |
| ops_meeting_entry_errorLoadMembers | Could not load members. | Error state |
| ops_meeting_detail_title | Meeting | Meeting detail page title |
| ops_meeting_detail_addMoreEntries | Add more entries | Link |
| ops_meeting_detail_errorLoad | Could not load meeting summary. | Error state |
| ops_meeting_detail_totalsHeading | Totals | Section heading |

### 2.8 Reversal and immutable history

| Key | Content | Usage |
|-----|---------|--------|
| ops_contribution_reverse | Reverse | Button |
| ops_contribution_reversalReasonRequired | Reason (required) | Label |
| ops_contribution_reversalDialogTitle | Reverse contribution | Dialog title |
| immutable_reversalExplanation | Reversing creates a reversing ledger entry… | Dialog body |
| immutable_recordReversedMessage | This record has been reversed. History is preserved for audit. | Reversed record banner |

### 2.9 Statements and member dashboard

| Key | Content | Usage |
|-----|---------|--------|
| member_statements_title | My statements | Page title |
| member_statements_noEntries | No entries | Empty title |
| member_statements_emptyDescription | Filter by date or record contributions to see activity. | Empty description |
| member_statements_dateFrom | From | Date filter |
| member_statements_dateTo | To | Date filter |
| member_statements_exportUnavailable | Export | Button (disabled) |
| member_statements_exportUnavailableHint | Export is not available yet. Use reports in the operations area when available. | Helper |
| member_backToDashboard | Back to Dashboard | Back link |
| member_dashboard_recentActivity | Recent activity | Section heading |
| member_dashboard_noRecentActivity | No recent activity | Empty title |
| member_dashboard_viewStatements | View statements | Link |

---

## 3. Narrow mobile labels (summary)

Use short labels on narrow screens to avoid wrapping:

| Context | Full | Short |
|---------|------|--------|
| Transaction mode | Bank transfer | Bank |
| Transaction mode | Cash | Cash |
| Dashboard card | Savings & statements. Records and receipts only. | Savings & statements |
| Back | Back to Meetings | Back |

Badge config already provides `getTransactionModeBadgeLabel(id, true)` for short labels.

---

## 4. Reconciliation-facing copy (user-safe)

- **Heading:** `save_reconciliation_heading` – "Recorded totals"
- **Disclaimer:** `save_reconciliation_disclaimer` – "For reconciliation only. These are records of amounts received outside the app."
- Use on treasurer meeting summary or reports where the audience may reconcile against external records. Keeps "recorded" and "outside the app" explicit.

---

## 5. Empty and error states

| Screen | Empty / error key | Message |
|--------|-------------------|--------|
| Meeting entry (no members) | ops_meeting_entry_noMembersTitle / noMembersDescription | No members / Add members to the group first. |
| Meeting entry (load fail) | ops_meeting_entry_errorLoadMembers | Could not load members. |
| Meeting detail (load fail) | ops_meeting_detail_errorLoad | Could not load meeting summary. |
| Statements (no data) | member_statements_noEntries / member_statements_emptyDescription | No entries / Filter by date or record contributions to see activity. |
| Statements (load fail) | member_statements_errorLoad | Could not load statements. |
| Dashboard (load fail) | member_dashboard_errorLoad | Could not load your summary. Please try again. |

---

## 6. Usage examples (code)

```ts
import { getCopy, getCopyTemplate, COPY_KEYS } from '@/lib/copy';

// Button and labels
getCopy(COPY_KEYS.ops_meeting_entry_reviewSubmit);  // "Review and submit"
getCopy(COPY_KEYS.save_transactionMode_bankShort); // "Bank" (narrow)

// Batch summary with count
getCopyTemplate(COPY_KEYS.save_batch_willBeRecorded, { count: 5 }); // "5 contribution(s) will be recorded."

// Statement line: keep savings and social fund separate
`${getCopy(COPY_KEYS.save_bucket_savings)} ${formatGBP(savings)} · ${getCopy(COPY_KEYS.save_bucket_socialFund)} ${formatGBP(social)}`

// Evidence locked state
getCopy(COPY_KEYS.save_evidence_lockedExplanation);
```

---

## 7. Testing and checks

- **Key coverage:** Test `frontend/__tests__/lib/copy/vc-save-copy-keys.test.ts` asserts that every key listed in this spec exists in `COPY_KEYS` and has a non-empty message.
- **Prohibited wording:** Run `npm run copy:check`; all messages must pass `findDoNotSayViolation()` (no "transfer sent", "we hold", "wallet", etc.).
- **Social fund vs savings:** In batch and statement copy, always use separate labels ("Savings total", "Social fund total") and never merge into a single "savings" phrase that could imply social fund is savings.
