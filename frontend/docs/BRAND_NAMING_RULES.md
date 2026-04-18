# VillageCircle360 Brand Naming Rules

How the master brand and module brands appear in UI, navigation, labels, and copy. Use with `lib/brand/architecture.ts` and `lib/brand/mvp-module-copy.ts`.

---

## 1. When to use "VillageCircle360" vs "VC"

| Context | Use | Example |
|--------|-----|--------|
| Legal pages (terms, privacy, regulatory) | Full **VillageCircle360** | "VillageCircle360 Terms of Use" |
| App title / shell (browser tab, header) | **VillageCircle360** or **VC360** | "VillageCircle360" or "VC360 – My circle" |
| Footer / about | **VillageCircle360** | "© VillageCircle360" |
| Nav area labels (product family) | **VC360** acceptable for brevity | "VC360" in app switcher if needed |
| In-session UI (dashboards, forms) | Prefer **module names** (VC Save, VC Hub, VC Grow) | "VC Save – Savings total" |
| Onboarding / first-run | **VillageCircle360** for welcome; then module names | "Welcome to VillageCircle360" then "VC Save", "VC Hub", "VC Grow" |

**Rule of thumb:** Legal and identity = full name. Day-to-day UI and feature areas = module names or VC360 where space is tight.

---

## 2. When to use module names (VC Save, VC Hub, VC Grow)

- **Navigation:** Use module names where the nav item maps to a product area (e.g. "My circle" for member = VC Save + VC Hub; "Loans" under VC Grow in section headers).
- **Dashboards:** Module cards or section titles (e.g. "VC Save – Savings & statements", "VC Hub – Meetings", "VC Grow – Loans").
- **Section headers:** When the section is clearly one module (e.g. "VC Grow – Repayment record").
- **Onboarding:** Module selection or description (e.g. "VC Save helps your group record savings and track payments.").

Use **displayName** from `BRAND_MODULE_CONFIG` (e.g. "VC Save") in UI. Use **shortLabel** (e.g. "Save") only where space is very limited and ensure it is still clear.

---

## 3. Where module names appear

| Surface | Allowed modules | Notes |
|---------|-----------------|--------|
| nav | save, hub, grow | MVP only; LATER (Pay, Learn) not in main nav |
| dashboard | save, hub, grow | Module cards or sections |
| section_header | save, hub, grow | Above feature content |
| onboarding | save, hub, grow | Module descriptions / selection |
| roadmap | pay, learn | "Coming later" / roadmap only |
| coming_soon | pay, learn | Placeholder tiles or banners |
| legal_footer_brand_only | (master only) | Use VillageCircle360; do not substitute module names for legal entity |

---

## 4. Where module names must NOT replace legal or product references

- **Terms of use / Privacy policy:** Refer to the **platform or legal entity** (e.g. "VillageCircle360", or the actual legal entity name if different). Do not say "VC Save terms" unless it is a distinct product agreement.
- **Regulator-facing or contractual text:** Use the **legal entity name** and/or "VillageCircle360" as the product name. Do not use "VC Hub" or "VC Grow" as the contracting party unless explicitly defined.
- **Error messages that imply liability or guarantee:** Use "VillageCircle360" or the legal entity, not "VC Save" or "VC Grow", when describing who operates the service.

**Rule:** Module names = product/feature branding. Legal entity / contracting party = full brand or legal name.

---

## 5. Later-release modules (VC Pay, VC Learn)

- **Visibility:** Shown only on **roadmap** and **coming_soon** surfaces unless a feature flag enables them.
- **Config:** `status: 'LATER'`, `allowedUISurfaces: ['roadmap', 'coming_soon']`.
- **Copy:** Use "Coming in a later release" or "VC Pay – Coming soon"; do not imply current availability.
- **Feature flag:** If you add a flag (e.g. `showLaterModules`), use it to show Pay/Learn only on roadmap/coming_soon; do not add them to main nav or dashboards until released.

---

## 6. Reference

- **Config:** `lib/brand/architecture.ts` – BRAND_MODULE_CONFIG, MASTER_BRAND_CONFIG, AllowedUISurface, isModuleAllowedOnSurface.
- **MVP-safe copy:** `lib/brand/mvp-module-copy.ts` and docs/BRAND_MVP_MODULE_COPY.md.
- **Do not say:** `lib/brand/do-not-say.ts` and listed in MVP module copy doc.
