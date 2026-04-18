# UK MVP/V1 frontend test coverage

Integration tests use **Jest** and **React Testing Library** with API/data mocking. There is **no E2E stack** (no Playwright/Cypress) in the repo; critical paths are covered by integration tests.

---

## Tested flows

| Flow | Test file(s) | What is covered |
|------|--------------|-----------------|
| **1. Member dashboard and statements** | `__tests__/app/member/dashboard.test.tsx`, `__tests__/app/member/statements.test.tsx` | Dashboard: separate savings and social fund totals; loading skeleton; error state with retry. Statements: load with contributions list; savings/social split per entry; loading; error; empty state. |
| **2. Treasurer mixed-mode meeting entry** | `__tests__/app/treasurer/meeting-entry.test.tsx` | Cash and bank transfer rows (per-row mode); social fund split; batch review with savings/social totals and cash/bank counts; evidence text reference (optional) in payload; submit batch with idempotency; loading and error states. |
| **3. Contribution reversal** | `__tests__/app/treasurer/meeting-reversal.test.tsx`, `__tests__/app/treasurer/contribution-detail-reversed.test.tsx` | Role-gated visibility (reverse button only with `contribution.reverse`); reason required before submit; reversed state shows immutable history and reversal details. |
| **4. Loan application and approval** | `__tests__/app/member/loan-request.test.tsx`, `__tests__/app/treasurer/loans-queue-approval.test.tsx` | Member: validation (amount, term), confirm step, API payload, domain error display. Treasurer: queue list with status filter; loading/error; submitted applications with link to detail; application detail shows approval section when user has `loan.approve`; approve confirmation dialog and mocked approve API call. |
| **5. Loan repayment** | `__tests__/app/treasurer/loan-repayment.test.tsx` | Cash repayment payload (amount, idempotency); cash with text reference; bank transfer with text reference; duplicate submit prevention (409 shows “already recorded”); submit disabled when pending; success allocation display. |
| **6. Notifications preferences** | `__tests__/app/member/notifications-preferences.test.tsx` | Non-critical SMS toggle: disabled when tenant SMS is disabled; enabled when tenant SMS is enabled. |
| **7. Admin support trace** | `__tests__/components/support/SupportAccessGate.test.tsx`, `__tests__/app/admin/traces-sections.test.tsx`, `__tests__/app/admin/evidence-preview-requires-support.test.tsx` | Reason code prompt and case ID in gate; gate blocks content until support access is set; trace view: support gate when inactive; timeline sections (Entity, Ledger events, Audit events, Evidence metadata, Notifications); read-only financial correction warning. Evidence preview: gated when support not active; audit warning when support active and data loaded. |

---

## Run tests

```bash
cd frontend
npm run test
# or watch mode
npm run test:watch
```

---

## Uncovered UI risks (manual testing before pilot)

- **Narrow viewport (320–430px)** – Layout, touch targets, and text wrap were hardened in code; **manually verify** on a real device or narrow viewport that dashboard, meeting entry, repayment, and admin traces are usable.
- **Evidence image upload (repayment)** – Integration tests cover **text reference** and payload shape; **image upload** in loan repayment is covered by `EvidenceField` / `EvidenceValidation` component tests. **Manually verify** end-to-end: select bank transfer, attach image, submit, and confirm evidence is stored and displayed.
- **Real API and auth** – All tests use mocked APIs and session/capabilities. **Manually verify** with real backend: login as member/treasurer/chair/admin, run through each flow once, and confirm permissions and data consistency.
- **Date filters and export (statements)** – Statements page has From/To date filters and a disabled Export button. **Manually verify** filtering and that export behaviour matches product expectations when implemented.
- **Navigation and back/unsaved** – `useBeforeUnload` is used on meeting entry, loan request, and repayment. **Manually verify** browser “Leave site?” when editing and navigating away.

---

## Previous module (mobile UX hardening)

The mobile-web UX hardening for UK MVP/V1 is **complete**: layout container (320–430px), touch targets (min 44px), keyboard focus, validation/error placement, long text wrap, loading/disabled on financial actions, a11y labels, status badge contrast, file upload feedback, and unsaved-changes protection are implemented across Member app, Treasurer meeting entry, evidence components, loan flows, and Admin support/audit UI.
