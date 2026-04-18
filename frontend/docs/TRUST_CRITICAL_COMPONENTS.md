# Trust-critical workflow components (UK MVP/V1)

Reusable components and patterns for forms, confirmations, warnings, evidence, and amounts in VillageCircle360. Use for contributions, repayments, reversals, and admin/support flows.

**Forms:** `@/components/forms` (CurrencyAmountField, SplitAmountGroup, TransactionModeSelector)  
**Dialogs:** `@/components/ui` (ConfirmActionDialog, ReverseRecordDialog, AuditAccessReasonDialog)  
**Status / empty:** `@/components/ui` (InlineStatusMessage, EmptyState, ErrorState)  
**Evidence:** `@/components/evidence` (EvidenceField, EvidenceViewer)

---

## 1. CurrencyAmountField

- **GBP display** with £ prefix; value in minor units (pence) for API.
- **Minor unit helpers:** Uses `displayToMinor` / `minorToDisplay` via CurrencyInput.
- **Slots:** `label`, `error`, `helperText`. Error is passed to CurrencyInput (aria-invalid, role="alert").

**Example (repayment amount):**

```tsx
<CurrencyAmountField
  id="repay-amount"
  label="Amount"
  valueMinor={amountMinor}
  onChangeMinor={setAmountMinor}
  error={errors.amount}
  helperText="Enter amount in pounds"
/>
```

---

## 2. SplitAmountGroup

- **Savings** and **social fund** amount inputs; **total** computed and displayed read-only.
- Uses CurrencyInput for each; total uses `formatGBP(savingsMinor + socialFundMinor)`.

**Example (contribution entry):**

```tsx
<SplitAmountGroup
  savingsMinor={savingsMinor}
  socialFundMinor={socialFundMinor}
  onSavingsChange={setSavingsMinor}
  onSocialFundChange={setSocialFundMinor}
  savingsError={errors.savings}
  socialFundError={errors.socialFund}
  savingsLabel="Savings (£)"
  socialFundLabel="Social fund (£)"
  totalLabel="Total"
/>
```

---

## 3. TransactionModeSelector

- **Cash / Bank transfer** as an accessible **radio group** (fieldset + legend).
- Labels: "Cash", "Bank transfer" (configurable). Use for contribution and repayment forms.

**Example:**

```tsx
<TransactionModeSelector
  value={transactionMode}
  onChange={setTransactionMode}
  label="Transaction mode"
  error={errors.transactionMode}
/>
```

---

## 4. EvidenceField pattern

- **Text reference** input (e.g. bank ref, receipt number).
- **Image upload** trigger (optional); **preview** slot via EvidencePreviewCard.
- **Locked state:** When `recordSubmitted` is true, evidence is read-only with an explanation: "Evidence is linked to this record and cannot be changed here. To correct evidence, reverse this record and create a new one."
- Use for contribution and repayment recording.

**Example:** See `EvidenceField` in `@/components/evidence`; use `recordSubmitted` when the record is already saved.

---

## 5. ConfirmActionDialog

- **Title**, **body**, **consequence text** (e.g. "This cannot be undone.").
- **Confirm** and **cancel** labels (e.g. "Record contribution", "Cancel").
- **Optional checkbox** for high-risk actions (`requireCheckbox={{ label: 'I understand this cannot be undone.' }}`).
- **Progress:** Use `confirming` to disable buttons and show "Please wait…" to prevent duplicate submissions.

**Example (approve loan):**

```tsx
<ConfirmActionDialog
  open={showApprove}
  title="Approve loan"
  body="This will mark the application as approved. The member can then proceed to disbursement."
  consequenceText="This action is recorded for audit."
  confirmLabel="Approve loan"
  cancelLabel="Cancel"
  variant="default"
  onConfirm={handleApprove}
  onCancel={() => setShowApprove(false)}
  confirming={isSubmitting}
/>
```

---

## 6. ReverseRecordDialog

- **Reason required** (text area); confirm disabled until reason is non-empty.
- **Immutable explanation** slot: e.g. "Reversing creates an audit trail. The original record remains visible but marked reversed."
- Use for contribution reversal, or any reversal that requires a reason.

**Example:**

```tsx
<ReverseRecordDialog
  open={showReverse}
  title="Reverse contribution"
  immutableExplanation="Reversing creates an audit trail. The original record remains visible but marked reversed. You cannot undo this."
  confirmLabel="Reverse record"
  onConfirm={(reason) => { submitReversal(reason); setShowReverse(false); }}
  onCancel={() => setShowReverse(false)}
  submitting={isSubmitting}
/>
```

---

## 7. AuditAccessReasonDialog

- **Support case / incident ID** (required text input).
- **Reason code** (optional select or hidden if not used).
- **Warning message** (e.g. "Access is logged for audit.").
- Use before opening admin trace or support-only views.

**Example:**

```tsx
<AuditAccessReasonDialog
  open={showAuditReason}
  title="Reason for access"
  warningMessage="Access to this area is logged for audit. Provide a support case or incident ID."
  caseIdLabel="Support case or incident ID"
  reasonOptions={[{ value: 'support', label: 'Support case' }, { value: 'incident', label: 'Incident' }]}
  onConfirm={({ caseId, reasonCode }) => { logAccess(caseId, reasonCode); setShowAuditReason(false); }}
  onCancel={() => setShowAuditReason(false)}
/>
```

---

## 8. InlineStatusMessage / Banner

- **Variants:** success, warning, error, info (semantic tokens).
- **banner:** When true, full-width block (e.g. top of section).
- Use for form feedback, immutable warnings, and post-submit success.

**Example:**

```tsx
<InlineStatusMessage variant="warning" title="Important">
  This action cannot be undone. Ensure amounts are correct before confirming.
</InlineStatusMessage>

<InlineStatusMessage variant="success" banner>Contribution recorded.</InlineStatusMessage>
```

---

## 9. Empty and Error states for financial lists

- **EmptyState:** Use for no contributions, no loans, no repayments. Provide `title`, `description`, optional `action` (e.g. "Record contribution").
- **ErrorState:** Use when list fetch fails; provide `message` and optional `onRetry`.

**Example (contributions list):**

```tsx
{error && <ErrorState message={error} onRetry={refetch} />}
{!error && items.length === 0 && (
  <EmptyState
    title="No contributions"
    description="Contributions for this period will appear here once recorded."
  />
)}
```

---

## Interaction and accessibility

- **Financial actions:** Use explicit confirmation (ConfirmActionDialog, ReverseRecordDialog) for reversal, approval, write-off, admin trace access.
- **Button labels:** Use exact action text (e.g. "Record contribution", "Reverse record", "Approve loan").
- **Locked evidence:** EvidenceField shows locked state and explanation; keep it visually distinct (muted background, no edit controls).
- **Progress / duplicate submit:** Use `confirming` or `submitting` to disable primary button and show "Please wait…".
- **Focus:** Dialogs use role="dialog", aria-modal="true", aria-labelledby; focus should move to dialog on open (caller may use ref + useEffect).
- **Labels:** All inputs have associated labels (htmlFor/id or aria-labelledby). Error messages use id and aria-describedby / aria-invalid.
- **Errors:** CurrencyAmountField, SplitAmountGroup, TransactionModeSelector, EvidenceField, and ReverseRecordDialog expose error slots and associate them with controls for screen readers.
