# Frontend scope control

**Apply to every frontend micro prompt.**

1. **Only implement the current micro prompt.** Do not add features, screens, or refactors that are not asked for.

2. **Do not redesign visuals or add unrelated screens.** Reuse existing layouts, styles, and navigation. Change only what the prompt specifies.

3. **Reuse existing shared components and API hooks where possible.** Prefer:
   - `@/components/ui` (PageHeader, StatCard, EmptyState, ErrorState, LoadingSkeleton, ConfirmDialog, PermissionDeniedNotice)
   - `@/components/forms` (CurrencyInput, SelectField, DateField, TextAreaField, PhoneInput, FilePicker, ImagePicker)
   - `@/components/evidence` (EvidenceBadge, EvidenceViewer)
   - `@/components/loan` (LoanScheduleTable, LoanExceptionHistory)
   - `@/lib/api` (apiClient, queryKeys, mutationHelper, mapApiErrorToUserMessage)
   - `@/lib/format` (formatGBP, formatUKDate, etc.)
   - `@/lib/evidence` (validateEvidenceImage, uploadAndRegisterEvidence)
   - `@/lib/validation` (displayToMinor, minorToDisplay, validateMinorUnits)

4. **For every task, report in this exact format:**
   - **Files changed** – List exact paths (e.g. `app/member/savings/page.tsx`, `lib/api/hooks/contributions.ts`).
   - **Screens touched** – List route paths or screen names that were added or modified (e.g. `/member/savings`, Treasurer dashboard).
   - **Tests added** – List test file paths and what they cover (e.g. `__tests__/contributions/record.test.tsx` – submit with idempotency key).
   - **Checks added** – List any run checks (e.g. `npm run copy:check`, `npm test -- …`, lint).

No other deliverables unless the micro prompt explicitly asks for them.

---

## Design system and UX copy scope

**When the micro prompt is design system or UX copy only, apply these rules in addition to the above.**

- **Only implement the current micro prompt.** Do not add new product features or backend changes.
- **Reuse existing token and copy structures.** Prefer:
  - `@/lib/design-system/tokens` (primitives, semantic, moduleAccents, statusTokens)
  - `@/lib/design-system/badges` (config, label getters)
  - `@/lib/copy` (COPY_KEYS, getCopy, messages)
  - `@/lib/brand` (architecture, logo-manifest, platform-branding)
- **Keep MVP wording aligned to software recordkeeping posture.** Use "recorded", "tracking", "receipt/log"; do not imply the platform holds funds, executes payments, or is a lender. Align with `docs/BRAND_MVP_MODULE_COPY.md` and `lib/brand/do-not-say.ts`.
- **Report:** Show exact files changed, screens touched (if any), tests added (if any), and checks added. No product or backend changes in design-system/UX-copy scope.

---

## Last implementation report

**Copy QA safeguards (UK MVP/V1).** Prohibited wording, key validation, dev placeholder, QA checklist; no product or backend changes.

**Files changed**

- `frontend/lib/brand/do-not-say.ts` – Added edit payment/contribution, update payment (reversal required).
- `frontend/lib/copy/qa.ts` – New: key validation and scanMessagesForProhibited.
- `frontend/lib/copy/messages.ts` – getCopy dev placeholder; getCopyTemplate uses getCopy.
- `frontend/lib/copy/index.ts` – Export qa. `package.json` – copy:lint.
- `docs/COPY_QA_CHECKLIST.md` – New: human QA checklist; optional grep for UI.
- `frontend/__tests__/lib/copy/copy-qa.test.ts` – New: prohibited scanner and key validation tests.

**Screens touched**

- None (dev placeholder only when key missing).

**Tests added**

- `frontend/__tests__/lib/copy/copy-qa.test.ts` – Prohibited scanner; key validation.

**Checks added**

- `npm run copy:check` or `npm run copy:lint` runs all copy tests including copy-qa.
