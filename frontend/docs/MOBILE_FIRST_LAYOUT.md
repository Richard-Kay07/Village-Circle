# Mobile-first layout patterns (UK MVP/V1)

Layout templates, list/card patterns, and responsive rules for VillageCircle360 member, treasurer, and admin screens.

**Layout components:** `@/components/layout`  
**Breakpoints:** `tokens.breakpoint` (narrow 360, mobile 430, tablet 768, desktop 1024)

---

## 1. Layout templates

### MobilePageLayout

- Single column, max-width from breakpoint.mobile (430px default), horizontal padding from `.layout-container`.
- Use for **member** and **treasurer** app screens.
- Props: `children`, `maxWidth?`, `paddingBottom?`.

### ListDetailLayout

- **Mobile:** Stacked (list above, detail below when `showDetail` true).
- **Desktop (768px+):** Split row – list left (320px), detail right. CSS in `globals.css` (`.list-detail-layout`).
- Use for contribution list → detail, loan queue → loan detail.
- Props: `list`, `detail`, `showDetail`, `listWidth?`.

### FormFlowLayout

- Main content area + optional **sticky action bar** at bottom (`.form-flow-layout__actions` in globals).
- Keeps primary actions in thumb zone on mobile; avoids horizontal scroll.
- Use for meeting entry, record repayment, and other key forms.
- Props: `children`, `actions?`.

### AdminConsoleLayout

- Wider max-width (640px default), responsive. Use for **admin support** screens.
- Props: `children`, `maxWidth?`.

---

## 2. List row / card patterns

- **ContributionListCard:** Link card with title, amount summary, date, StatusBadge, TransactionModeBadge. Use in VC Save contribution views.
- **LoanListCard:** Link card with title, amount summary, date, StatusBadge, subtitle. Use in VC Grow loan queue and member My Loans.
- **NotificationListRow:** Row with title, time, ChannelBadge, read state. Use in notifications list.
- **AuditEventRow:** Dense row for event type, meta, entity ref. Use in audit log and timeline.

All use `break-word` and avoid horizontal scroll; no heavy tables on mobile.

---

## 3. Summary strip / card patterns

- **TotalsByBucketCard:** Buckets (e.g. Savings total, Social fund total) + optional total line. Use for meeting summary, dashboard strips.
- **TransactionModeCountStrip:** "Cash: n · Bank transfer: n" (optional amount). Use below contribution lists.
- **StatusSummaryStrip:** "Recorded: 10 · Reversed: 1". Use for list summaries.

---

## 4. Responsive behavior rules

- **Collapse tables on mobile:** Prefer card/row lists instead of tables for narrow widths; or use expandable rows (show key columns, expand for rest). Avoid horizontal scroll for core workflows.
- **Primary actions:** Keep submit/confirm/cancel visible – use FormFlowLayout sticky bar or place actions at bottom of viewport within thumb zone.
- **Horizontal scroll:** Avoid for core flows (contribution entry, repayment, list views). Use wrapping and single-column layout on narrow screens.
- **Touch targets:** Minimum 44px (tokens.touchTargetMin); layout components do not shrink action areas below that.

---

## 5. Examples

- **VC Save contribution views:** MobilePageLayout + list of ContributionListCard + TotalsByBucketCard + TransactionModeCountStrip. Detail: FormFlowLayout for reversal with sticky "Reverse record" bar.
- **VC Hub meeting and governance:** MobilePageLayout + TotalsByBucketCard for meeting totals; ContributionListCard for entries; FormFlowLayout for meeting entry form with sticky "Submit" bar.
- **VC Grow loan queue:** ListDetailLayout with LoanListCard list and loan detail in detail pane; or MobilePageLayout + LoanListCard list only with detail on separate route. Loan detail: FormFlowLayout for "Record repayment" with sticky actions.

---

## 6. CSS classes (globals.css)

- `.layout-container` – horizontal padding (1rem; 0.75rem at max-width 430px).
- `.list-detail-layout` – at 768px+ becomes row, list fixed width, detail flex.
- `.form-flow-layout__actions` – sticky bottom bar with border and shadow.
- `.break-word` – word-break for long IDs/refs.
- `.meeting-entry-row-grid` – two columns; at 360px single column.

---

## 7. Testing

- Verify primary actions (submit, cancel, back) remain in DOM and visible at 320px width (no `display: none` or overflow hidden that removes them).
- Optional: snapshot or viewport tests for layout at 360px and 768px to catch regressions.
