# Design system – UK MVP guide (VC Save, VC Hub, VC Grow)

Practical reference for tokens, components, badges, layouts, and UX copy. Use this so Cursor-generated work stays aligned with recordkeeping-safe wording and shared patterns.

**Related:** `DESIGN_SYSTEM.md` · `TRUST_CRITICAL_COMPONENTS.md` · `MOBILE_FIRST_LAYOUT.md` · `docs/SMS_COPY_SPEC.md` · `docs/LEGAL_UX_COPY.md`

**Preview routes (no Storybook in repo):** `/design-system/tokens`, `/design-system/badges`, `/design-system/layout`, `/design-system/logo`, `/design-system/status-timeline` – run the app to verify examples render.

---

## 1. Token usage hierarchy

```
primitives  →  semantic  →  module aliases / status
   ↓              ↓                    ↓
 lib/design-system/tokens/primitives.ts
 lib/design-system/tokens/semantic.ts
 lib/design-system/tokens/module-accents.ts   (vcSave, vcHub, vcGrow, …)
 lib/design-system/tokens/status.ts         (recorded, pending, overdue, …)
```

| Layer | Purpose | Example |
|-------|---------|---------|
| **Core (primitives)** | Raw palette, spacing, typography | `primitives.color.blue[500]`, `p.spacing[4]` |
| **Semantic** | Surface, text, border, success/warning/error | `semantic.text.muted`, `semantic.surface.default` |
| **Module aliases** | Product accent per module | `moduleAccents.vcSave.default` · legacy `tokens.color.save` / `hub` / `grow` |
| **Status** | Record lifecycle and delivery | `statusTokens.recorded`, `statusTokens.overdue` |

**Import:** `import { tokens } from '@/lib/design-system/tokens'`

**In CSS:** `app/globals.css` `:root` exposes `var(--vc-*)` – prefer these for theming.

**Rule:** Prefer semantic or module tokens in new UI; avoid hardcoded hex/rgb.

---

## 2. Component usage and props (MVP)

| Area | Component | Location | Notes |
|------|-----------|----------|--------|
| Page chrome | `PageHeader`, `EmptyState`, `ErrorState`, `LoadingSkeleton` | `@/components/ui` | Back link, title, subtitle from copy keys |
| Confirmation | `ConfirmDialog` | `@/components/ui` | `variant?: 'default' \| 'danger'`; title/message/cancel/confirm labels |
| Reversal | `ReverseRecordDialog` | `@/components/ui` | `immutableExplanation` required; reason required before confirm |
| Support access | `AuditAccessReasonDialog` | `@/components/ui` | `warningMessage` + case ID + reason code |
| Evidence | `EvidenceBadge`, `EvidenceViewer` | `@/components/evidence` | Locked state copy from `save_evidence_lockedExplanation` |
| Loan | `LoanScheduleTable`, `LoanExceptionHistory` | `@/components/loan` | `emptyDescription` from grow copy keys |

**Forms:** `CurrencyAmountField`, `SplitAmountGroup`, `TransactionModeSelector` – see `TRUST_CRITICAL_COMPONENTS.md`.

---

## 3. Confirmation dialog patterns

**Confirm-only (no reason):** `ConfirmDialog` – approve/reject, simple confirm.

```tsx
<ConfirmDialog
  open={open}
  title={getCopy(COPY_KEYS.hub_approval_confirmApprove)}
  message={getCopy(COPY_KEYS.hub_approval_makingDecisionDescription)}
  confirmLabel={getCopy(COPY_KEYS.common_button_confirm)}
  cancelLabel={getCopy(COPY_KEYS.common_button_cancel)}
  onConfirm={handleApprove}
  onCancel={() => setOpen(false)}
/>
```

**Reversal (reason required):** `ReverseRecordDialog` – contribution reversal; explanation that original record stays visible.

```tsx
<ReverseRecordDialog
  open={open}
  title="Reverse contribution"
  immutableExplanation={getCopy(COPY_KEYS.immutable_reversalExplanation)}
  reasonLabel={getCopy(COPY_KEYS.ops_contribution_reversalReasonRequired)}
  onConfirm={(reason) => mutation.mutateAsync({ reason })}
  onCancel={() => setOpen(false)}
  submitting={mutation.isPending}
/>
```

**Reason-coded admin access:** `AuditAccessReasonDialog` – support case ID + reason code before viewing traces/evidence.

```tsx
<AuditAccessReasonDialog
  open={open}
  title={getCopy(COPY_KEYS.admin_support_gate_title)}
  warningMessage={getCopy(COPY_KEYS.legal_supportReason_warning)}
  onConfirm={({ caseId, reasonCode }) => setSupportState({ ... })}
  onCancel={onCancel}
/>
```

---

## 4. Evidence locked-state pattern

After a record is submitted, evidence is **read-only**. Copy must explain that changing evidence requires reversal + new record.

- **Copy key:** `COPY_KEYS.save_evidence_lockedExplanation` (or equivalent grow keys on loan surfaces).
- **Rule:** Do not imply the platform “fixes” evidence in place; use “reverse and create a new record”.

---

## 5. Reason-code prompt pattern

Used for **admin/support** traces and evidence (not for member-facing contribution reversal reason alone – that uses `ReverseRecordDialog`).

- Gate component: `SupportAccessGate` – case ID, reason code, tenant group ID, actor user ID.
- Copy: `legal_supportReason_*`, `admin_support_gate_*` from `@/lib/copy`.
- **Rule:** Access is logged; use accountability wording from `LEGAL_UX_COPY.md`.

---

## 6. Side-by-side – VC Save, VC Hub, VC Grow

### VC Save – contribution entry / reversal

| Aspect | Pattern |
|--------|--------|
| **Layout** | Meeting entry flow → batch review; use `SplitAmountGroup`, transaction mode from copy (`save_transactionMode_*`). |
| **Copy** | `save_mvp_perimeter`, `save_externalRef_*`, `immutable_*` for reversal. |
| **Status** | `STATUS_BADGE_LABELS.recorded` / `reversed` via badges config. |
| **Do** | “Record contribution”, “Reversal record created”, external ref for bank/cash. |
| **Don’t** | “Payment sent”, “Transfer completed by app”. |

### VC Hub – approval and governance warning

| Aspect | Pattern |
|--------|--------|
| **Layout** | Approval queue page; `ConfirmDialog` or hub-specific approve/reject copy. |
| **Copy** | `hub_approval_*`, `hub_rule_change_warningTitle/Body`, `hub_meeting_reopen_warning*`. |
| **Status** | `pending` / `approved` badges; governance warnings as read-only banners. |
| **Do** | “Confirm approval”, “Existing entries remain audited.” |
| **Don’t** | Guarantee of payout; platform as decision-maker. |

### VC Grow – repayment entry and loan schedule

| Aspect | Pattern |
|--------|--------|
| **Layout** | Repay page: outstanding + allocation order explainer; `LoanScheduleTable` with `emptyDescription`. |
| **Copy** | `grow_repay_*`, `grow_mvp_perimeter`, `grow_repay_allocationOrderExplainer` (penalties → interest → principal). |
| **Status** | Overdue via status tokens + grow overdue reminder copy. |
| **Do** | “Record repayment”, “Schedule and history recorded for audit.” |
| **Don’t** | “Loan from VillageCircle360”, “Platform lends”. |

---

## 7. Do / Do not (labels, statuses, warnings, legal)

| Topic | Do | Do not |
|-------|-----|--------|
| **Labels** | Record, reverse, approve/reject application, view statement | Pay (as execution), transfer (as app execution), “your balance with us” |
| **Statuses** | Recorded, pending, approved, overdue, reversed, failed (delivery) | “Cleared”, “Settled by platform” |
| **Warning copy** | Reopen allows further changes; prior schedule superseded; access logged | Legal boilerplate in every banner; guarantees |
| **Legal disclaimers** | Central keys in `legal_*`; place once per flow; counsel placeholders in brackets | Hardcoded legal paragraphs scattered in components |

Run **`npm run copy:check`** (frontend) to catch do-not-say violations in copy messages.

---

## 8. Badges and layouts (quick ref)

- **Badges:** `lib/design-system/badges/config.ts` – `getStatusBadgeLabel`, `getChannelBadgeLabel`, `getTransactionModeBadgeLabel`. Preview: `/design-system/badges`.
- **Layouts:** `AdminConsoleLayout`, `MobilePageLayout`, etc. – see `MOBILE_FIRST_LAYOUT.md` and `/design-system/layout`.

---

## 9. Quick-start – new screens

1. **Copy:** Add keys only in `lib/copy/keys.ts` + `messages.ts`; use `getCopy` / `getCopyTemplate` in UI. No hardcoded user-facing strings.
2. **Tokens:** Use `tokens` or `var(--vc-*)`; module accent via `tokens.color.save` / `hub` / `grow` where appropriate.
3. **Financial actions:** Reversal → `ReverseRecordDialog` + `immutable_*` copy. Admin support → reason code + `AuditAccessReasonDialog` or `SupportAccessGate`.
4. **MVP posture:** Align with `lib/brand/do-not-say.ts` and `legal_*` perimeter copy where relevant.
5. **Checklist:** Use `docs/DESIGN_SYSTEM_PR_CHECKLIST.md` before PR.

---

## 10. Testing / verification

- **No Storybook** in this repo. **Design-system routes** under `app/design-system/*` – start dev server and open `/design-system/tokens` (etc.) to confirm pages render.
- **Copy:** `npm run copy:check` in `frontend/`.
- **Lint:** Read_lints on touched files after edits.
