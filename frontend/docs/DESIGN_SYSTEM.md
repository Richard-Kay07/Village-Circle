# VillageCircle360 design system and UX copy

Consistent, scalable, trust-first design and copy for UK MVP/V1. Reusable across web and mobile; extensible to later product lines.

**Quick links**

- **MVP guide (tokens, components, Save/Hub/Grow examples, do/don’t, quick-start):** `frontend/docs/DESIGN_SYSTEM_MVP_GUIDE.md`
- **PR review checklist:** `docs/DESIGN_SYSTEM_PR_CHECKLIST.md`
- **Storybook:** not in repo. **Live previews:** `/design-system/tokens`, `/design-system/badges`, `/design-system/layout`, `/design-system/logo`, `/design-system/status-timeline` – run the app to verify examples render.

---

## 1. Brand and product architecture (fixed)

| Level | Name | Scope |
|-------|------|--------|
| **Master brand** | VillageCircle360 | All products |
| **VC Save** | Savings, payments, remittances | MVP |
| **VC Hub** | Groups, governance, share-out, voting | MVP |
| **VC Grow** | Micro-loans, asset finance, credit building | MVP |
| **VC Pay** | Merchant QR, POS, collections, invoices | Later |
| **VC Learn** | Short courses: money, business, agri, digital safety | Later |

**UK MVP perimeter:** Software-only recordkeeping and workflow. No holding of funds, movement of money, e-money issuance, or regulated lending. Copy must not imply execution of regulated banking/payment when the app only records or tracks external transactions.

**Machine-readable config and naming rules:**
- **Config:** `lib/brand/architecture.ts` – `BRAND_MODULE_CONFIG` (id, displayName, shortLabel, status, purposeSummary, allowedUISurfaces, iconTokenPlaceholder, colorTokenAlias, legalWordingNotes).
- **Naming rules:** `docs/BRAND_NAMING_RULES.md` – when to use "VillageCircle360" vs "VC", where module names appear, legal vs product references.
- **MVP-safe copy:** `lib/brand/mvp-module-copy.ts`, `docs/BRAND_MVP_MODULE_COPY.md`, `lib/brand/do-not-say.ts`.
- **Examples:** `lib/brand/example-snippets.ts` – nav labels, dashboard cards, onboarding, legal usage.
- **Logo and brand assets:** `lib/brand/logo-manifest.ts` – BRAND_ASSET_MANIFEST, getBrandAssetById, getLockupForTheme, getSymbolForTheme. **Usage spec:** `docs/LOGO_USAGE.md`. **Asset folder:** `public/brand/logo/`. **Example surfaces:** `/design-system/logo`.
- **Platform branding (favicon, app icon, splash):** `lib/brand/platform-branding.ts` – PLATFORM_BRANDING_SPEC. **Usage:** `docs/APP_ICON_FAVICON_BRANDING.md`, `docs/SPLASH_LOADING_BRANDING.md`, `docs/PLATFORM_BRANDING_IMPLEMENTATION.md`.
- **Icon, badge and module identity:** `docs/ICON_BADGE_MODULE_IDENTITY.md`. **Components:** `ModuleBadge`, `StatusBadge`, `ChannelBadge`, `TransactionModeBadge` in `components/ui`. **Config:** `lib/design-system/badges/config.ts`. **Examples:** `/design-system/badges`.
- **Trust-critical workflow components:** `docs/TRUST_CRITICAL_COMPONENTS.md` – forms (CurrencyAmountField, SplitAmountGroup, TransactionModeSelector), confirmations (ConfirmActionDialog, ReverseRecordDialog, AuditAccessReasonDialog), InlineStatusMessage, EvidenceField pattern, Empty/Error states. Usage examples from contributions, repayments, admin support; accessibility notes.
- **Mobile-first layout:** `docs/MOBILE_FIRST_LAYOUT.md`. **Components:** `@/components/layout` – MobilePageLayout, ListDetailLayout, FormFlowLayout, AdminConsoleLayout; ContributionListCard, LoanListCard, NotificationListRow, AuditEventRow; TotalsByBucketCard, TransactionModeCountStrip, StatusSummaryStrip. **Examples:** `/design-system/layout`.

---

## 2. Design tokens

### 2.1 Where they live

- **TypeScript:** `lib/design-system/tokens.ts` (re-exports from `tokens/index.ts`) – primitives, semantic, module accents, status. Use in components or tests.
- **CSS:** `app/globals.css` `:root` – use `var(--vc-*)` in styles for theming and consistency.
- **Token docs and examples:** `docs/TOKENS.md`. **Token showcase:** `/design-system/tokens` (preview page).

### 2.2 Token groups

| Group | Purpose | Example |
|-------|---------|--------|
| **color** | Primary, text, surfaces, semantic (success, warning, error), product accents | `--vc-color-primary`, `--vc-color-text-muted` |
| **space** | 4px base scale (1 = 0.25rem) | `--vc-space-2`, `--vc-space-4` |
| **radius** | sm, md, lg | `--vc-radius-md` |
| **font** | Family, sizes (xs–2xl), weights | `--vc-font-family`, `--vc-font-size-base` |
| **touch** | Minimum tap target | `--vc-touch-target-min` (44px) |

### 2.3 Example usage

**In CSS / className + style:**

```css
.my-card {
  background: var(--vc-color-surface);
  border: 1px solid var(--vc-color-border);
  border-radius: var(--vc-radius-lg);
  padding: var(--vc-space-4);
}
```

**In TypeScript (e.g. inline styles):**

```ts
import { tokens } from '@/lib/design-system/tokens';

<div style={{
  color: tokens.color.primary,
  fontSize: tokens.font.size.base,
  padding: tokens.space[4],
}} />
```

---

## 3. UX copy layer

### 3.1 Goals

- Clear, unambiguous wording (UK English).
- Audit-friendly action labels (e.g. "Record repayment", "Reverse").
- Safe financial language: no misleading terms; MVP = recordkeeping only.
- Scalable: keys, central messages, optional templates/variables.

### 3.2 Where it lives

- **Keys:** `lib/copy/keys.ts` – `COPY_KEYS` and type `CopyKey`.
- **Messages:** `lib/copy/messages.ts` – UK English strings; `getCopy(key)`.
- **Public API:** `lib/copy/index.ts` – export keys, messages, `getCopy`.

### 3.3 Naming convention

`area_context_element` – e.g. `common_button_retry`, `member_dashboard_savingsTotal`, `ops_loan_repay_record`.

### 3.4 MVP safety wording

- Prefer **"record" / "recorded" / "recorded in the system"** for contributions and repayments (not "pay" or "transfer" when the app only records).
- Use **"This app does not hold or move funds"** (or equivalent) where needed.
- Loans: **"This app records applications and repayments; it does not provide or execute lending."**
- Avoid: guaranteed outcomes, financial advice, or implying regulated execution when not implemented.

### 3.5 Example usage

```ts
import { getCopy, COPY_KEYS } from '@/lib/copy';

// Simple
<button>{getCopy(COPY_KEYS.common_button_retry)}</button>
<PageHeader title={getCopy(COPY_KEYS.member_dashboard_title)} subtitle={getCopy(COPY_KEYS.member_dashboard_subtitle)} />

// Audit-friendly action labels
getCopy(COPY_KEYS.ops_contribution_reverse)   // "Reverse"
getCopy(COPY_KEYS.ops_loan_repay_record)      // "Record repayment"
```

### 3.6 Product-module copy (VC Save, VC Hub, VC Grow)

Use keys that map to product context:

- **VC Save:** member dashboard, statements, contributions (savings/social fund).
- **VC Hub:** group, meetings, governance (same ops copy where applicable).
- **VC Grow:** loan application, repayment, schedule (with MVP loan disclaimer where appropriate).

Placeholders for **VC Pay** and **VC Learn:** use `pay_comingLater` and `learn_comingLater` when surfacing future modules.

---

## 4. Product modules (brand)

- **Source:** `lib/brand/product-modules.ts`.
- **Exports:** `PRODUCT_MODULES`, `MVP_MODULES`, `LATER_MODULES`, `getProductModule(id)`, `isMvpModule(id)`.
- Use for nav labels, section headers, or future theming by product (e.g. accent colour per module).

**Example:**

```ts
import { getProductModule, MVP_MODULES } from '@/lib/brand/product-modules';

const save = getProductModule('save');  // { name: 'VC Save', tagline: '...', scope: 'mvp' }
// MVP_MODULES = ['save', 'hub', 'grow']
```

---

## 5. Component patterns

- **Layout:** Use `layout-container` for horizontal padding; respect `--vc-touch-target-min` for buttons and links.
- **Focus:** Rely on global `:focus-visible` (token-based primary outline).
- **Long text/IDs:** Use `break-word` class.
- **New UI:** Prefer `var(--vc-*)` in CSS and `getCopy()` for user-facing strings.

Existing components (e.g. StatCard, ErrorState, ConfirmDialog) can be migrated incrementally to tokens and copy keys; new components should use the system from the start.

---

## 6. How to review

1. **Tokens:** Run app; confirm colours and spacing match intent; check `lib/design-system/tokens.ts` and `app/globals.css` `:root`.
2. **Copy:** Search for `getCopy(COPY_KEYS` and confirm labels and messages are used; read `lib/copy/messages.ts` for UK English and MVP-safe wording.
3. **Brand:** Confirm no copy implies fund-holding or payment execution; check product module names in `lib/brand/product-modules.ts`.
4. **Accessibility:** Touch targets ≥ 44px; focus visible; contrast (tokens use WCAG-friendly values).

---

## 7. Assumptions

- MVP remains software-only; no change to backend behaviour.
- UK English and UK locale for formatting (existing `formatGBP`, `formatUKDate`).
- Mobile-first; same tokens/copy usable for future native or wrapper apps.
- VC Pay and VC Learn are placeholders only (copy keys and product module entries; no flows).

---

## 8. Follow-up (optional)

- Migrate more components to `var(--vc-*)` and `getCopy()`.
- Add templated copy helper, e.g. `getCopyTemplate(key, { amount, date })`, if needed.
- Add per–product-module accent to nav or section headers using `tokens.color.save` / `hub` / `grow`.
