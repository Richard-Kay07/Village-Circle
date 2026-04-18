# Status and timeline presentation standards (UK MVP/V1)

VillageCircle360 status vocabulary, timeline event rendering, record metadata hierarchy, traceability IDs, and immutable-history messaging.

## 1. Status vocabulary (copy + visual mapping)

Status labels and badge styling are defined per domain. Use `frontend/lib/status-vocabulary.ts` for labels and `StatusId` for badges (`frontend/lib/design-system/tokens/status.ts`, `frontend/lib/design-system/badges/config.ts`).

| Domain | Raw status (API) | Label | StatusId (badge) |
|--------|-------------------|-------|------------------|
| **Contribution** | RECORDED | Recorded | recorded |
| | REVERSED | Reversed | reversed |
| **Loan** | PENDING | Pending | pending |
| | APPROVED | Approved | approved |
| | DISBURSEMENT_RECORDED / ACTIVE | Disbursed / Active | recorded |
| | OVERDUE | Overdue | overdue |
| | REPAID | Repaid | recorded |
| | WAIVED / WRITEOFF_RECORDED | Waived / Write-off | reversed |
| **Repayment** | RECORDED | Recorded | recorded |
| | FAILED | Failed | failed |
| **Notification** | SENT / PENDING | Sent | recorded |
| | DELIVERED | Delivered | delivered |
| | FAILED | Failed | failed |
| **Evidence** | ATTACHED | Attached | recorded |
| **Admin support** | STARTED | Access started | recorded |
| | EVIDENCE_VIEWED | Evidence viewed | recorded |

- **SMS / webhook**: Use notification vocabulary; actions `SMS_WEBHOOK_DELIVERED` / `SMS_WEBHOOK_FAILED` map to timeline labels "SMS delivered" / "SMS delivery failed".
- Always pair badges with text labels; do not rely on colour alone.

## 2. Timeline item component

**Component:** `frontend/components/ui/TimelineItem.tsx`

Renders a single timeline event with:

- **Action label** – Human-readable (e.g. from `getAuditActionLabel(actionKey)`).
- **Actor** – Who performed the action (e.g. "By Jane").
- **Time** – Formatted datetime.
- **Status badge** – Optional `statusId` for `StatusBadge`.
- **Entity link / ID** – Optional `entityHref` and/or `entityId` (long IDs use `TraceableIdDisplay`).
- **Metadata summary** – One-line summary.
- **Expand/collapse** – Optional `details` with "Show details" / "Hide details".

Use for: contribution reversal timeline, loan approval/disbursement/repayment, admin evidence access, SMS webhook events.

## 3. Record metadata display hierarchy

1. **Primary**: Action + status + time (and actor when relevant).
2. **Secondary**: Entity link and/or truncated ID.
3. **Tertiary**: Metadata summary; expandable details for payloads, reasons, trace IDs.

## 4. Traceability links and IDs

- **Entity links**: Prefer "View record" linking to the entity detail (e.g. `/treasurer/contributions/[id]`).
- **Long-ID display** (`TraceableIdDisplay`):
  - Truncate: first 8 + "…" + last 4 characters by default.
  - Copy button: copy full value to clipboard.
  - Expand: "Show full" / "Show less" to reveal full ID.
- Use for: contribution ID, loan ID, ledger event ID, evidence ID, notification/trace IDs in audit UIs.

## 5. Immutable history messaging

Central copy keys (`frontend/lib/copy/keys.ts` + `messages.ts`):

- **Original record preserved:** `immutable_originalRecordPreserved` – "The original record is preserved and remains visible."
- **Reversal created:** `immutable_reversalCreated` – "A reversal record has been created."
- **History visible:** `immutable_historyVisible` – "History is visible for audit."
- **Reversal explanation (dialog):** `immutable_reversalExplanation` – Full sentence for reverse-record dialogs.
- **Reversed record banner:** `immutable_recordReversedMessage` – "This record has been reversed. History is preserved for audit."

Use in: reversal dialogs, reversed record detail pages, audit/trace views.

## 6. Examples

- **Contribution reversal timeline:** CONTRIBUTION_RECORDED → CONTRIBUTION_REVERSED with reversal reason in details; status badge Reversed; entity link to contribution.
- **Loan lifecycle:** LOAN_APPLICATION_SUBMITTED → LOAN_APPROVED → LOAN_DISBURSEMENT_RECORDED → LOAN_REPAYMENT_RECORDED (each as a timeline item with status and optional entity ID).
- **Admin evidence access:** SUPPORT_ACCESS_STARTED, SUPPORT_EVIDENCE_VIEWED with actor and time; entity link to evidence/contribution.
- **SMS webhook:** SMS_WEBHOOK_DELIVERED / SMS_WEBHOOK_FAILED with time and optional metadata (provider ref, error); status badge Delivered / Failed.

Live examples: `frontend/app/design-system/status-timeline/page.tsx` (design-system route).

## 7. Testing

- **Status mapping:** `frontend/__tests__/lib/status-vocabulary.test.ts` – Known statuses per domain resolve to expected labels and `StatusId`.
- **Timeline item:** `frontend/__tests__/components/ui/TimelineItem.test.tsx` – Renders with long ID and expandable metadata; expand shows full ID and details.
