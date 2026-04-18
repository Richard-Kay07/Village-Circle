# Legal and compliance UX copy – UK MVP/V1

UI legal copy placeholders and standard wording wrappers for VillageCircle360. Use UK standard wording style. Placeholders are for legal counsel–approved final text; do not fabricate legal advice.

## 1. Copy namespaces and keys

All legal copy lives under the `legal_` namespace in `frontend/lib/copy/keys.ts` and `messages.ts`.

| Namespace / area | Keys | Use |
|------------------|------|-----|
| **legal.termsSummary** | `legal_termsSummary_short`, `legal_termsSummary_full` | Inline summary; modal/banner full text or link to terms |
| **legal.privacySummary** | `legal_privacySummary_short`, `legal_privacySummary_full` | Inline summary; modal/banner full text or link to privacy policy |
| **legal.nonBankDisclaimer** | `legal_nonBankDisclaimer_short`, `legal_nonBankDisclaimer_full` | Non-bank / non-wallet messaging |
| **legal.recordkeepingNotice** | `legal_recordkeepingNotice_save_short/full`, `_hub_*`, `_grow_*` | MVP-safe module disclaimers (Save, Hub, Grow) |
| **legal.evidenceUploadNotice** | `legal_evidenceUploadNotice_short`, `legal_evidenceUploadNotice_full` | Evidence upload surfaces; privacy/retention |
| **legal.supportAccessNotice** | `legal_supportAccessNotice_short`, `legal_supportAccessNotice_full` | Admin support access; accountability |
| **legal.onboarding** | `legal_onboarding_disclaimer_short`, `legal_onboarding_disclaimer_full` | Signup / invite acceptance |
| **legal.permissionDenied** | `legal_permissionDenied_inline`, `legal_permissionDenied_contactAdmin` | Permission denied and support contact |
| **legal.supportReason** | `legal_supportReason_prompt`, `legal_supportReason_warning`, `legal_supportReason_requiredFields` | Admin support reason-code prompts and warnings |
| **legal.supportEvidence** | `legal_supportEvidence_auditedBanner`, `legal_supportEvidence_accessDenied`, `legal_supportEvidence_gateTitle` | Admin evidence preview banner, access-denied message, and gate title |

## 2. MVP-safe module disclaimers

Use these variants by module (recordkeeping posture only):

- **VC Save:** `legal_recordkeepingNotice_save_short` / `_full` – records/tracks external transactions and contributions; app does not hold or move funds.
- **VC Hub:** `legal_recordkeepingNotice_hub_short` / `_full` – governance and recordkeeping workflows; app does not execute financial transactions.
- **VC Grow:** `legal_recordkeepingNotice_grow_short` / `_full` – loan workflow records and approvals for groups; platform does not provide or execute lending.

All text must remain consistent with `lib/brand/do-not-say.ts` and recordkeeping posture.

## 3. UI placements and rules

| Placement | When to show | Copy to use |
|-----------|----------------|-------------|
| **Signup / invite acceptance** | On signup or when accepting an invite to a group | `legal_onboarding_disclaimer_short` (inline) or `_full` (modal/banner); optionally `legal_termsSummary_*`, `legal_privacySummary_*` |
| **Group creation** | When creating a new group | Optional: `legal_recordkeepingNotice_hub_short` or module-appropriate notice |
| **First financial record action** | Optional banner or one-time dialog before first contribution/loan record | `legal_recordkeepingNotice_save_short` or `_grow_short` as appropriate; or `legal_nonBankDisclaimer_short` |
| **Evidence upload surfaces** | On contribution/repayment forms or evidence upload UI | `legal_evidenceUploadNotice_short` (inline near upload); expandable or modal `_full` if needed |
| **Admin support trace / evidence preview** | When entering support access gate or viewing evidence with reason code | `legal_supportAccessNotice_short` / `_full`; `legal_supportReason_*`; `legal_supportEvidence_auditedBanner` on evidence view |

Use **short** for inline, tooltips, or compact banners; use **full** for modals, expanded panels, or footer/legal links.

## 4. Concise vs expanded

- **Short (inline):** One or two sentences; suitable for checkboxes, footers, or under forms.
- **Full (modal/banner):** Full paragraph or link to policy; use for acceptance flows, first-use disclaimers, or support-access confirmation.

Always use `getCopy(COPY_KEYS.legal_*)` – never hardcode legal copy in components.

## 5. Permission denied and support access

- **Permission denied:** Use `legal_permissionDenied_inline` for the main message and `legal_permissionDenied_contactAdmin` for the “contact admin” line (or existing `common_permissionDenied` / `hub_permission_denied_*` where already wired).
- **Support reason prompts:** Use `legal_supportReason_prompt` for the gate description, `legal_supportReason_warning` for accountability wording, `legal_supportReason_requiredFields` for validation message. Support evidence view uses `legal_supportEvidence_auditedBanner` and `legal_supportEvidence_accessDenied`.

## 6. Placeholder token conventions for counsel replacement

- Placeholders in `messages.ts` are written in square brackets, e.g. `[Replace with counsel-approved summary.]`.
- To replace centrally: edit only `frontend/lib/copy/messages.ts` for the relevant `legal_*` entry.
- Do not remove the key; only replace the string value. This keeps UI references valid and allows staged rollout of counsel-approved text.
- Optional: use a single constant or comment in `messages.ts` to mark which keys are still placeholder, e.g. `// LEGAL_PLACEHOLDER: legal_termsSummary_full`.

## 7. Testing and checks

- **Validate placeholders referenced:** All legal copy must be referenced via `COPY_KEYS.legal_*` and `getCopy()` (or `getCopyTemplate()`); no hardcoded legal strings in UI.
- **Module disclaimers MVP-safe:** Run do-not-say and recordkeeping checks on `legal_recordkeepingNotice_*` and `legal_nonBankDisclaimer_*` (see `frontend/__tests__/lib/copy/legal-copy.test.ts`). The test asserts every `legal_*` key has a non-empty message and that recordkeeping/non-bank disclaimers pass `findDoNotSayViolation`.
- **Copy check:** `npm run copy:check` in `frontend/` should pass (all keys have messages).
