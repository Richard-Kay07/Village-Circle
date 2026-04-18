# VillageCircle360 logo usage rules

Master logo integration and brand asset usage for UK MVP/V1. The logo is the source-of-truth visual reference; do not redraw, distort or "improve" approved assets.

**Manifest:** `lib/brand/logo-manifest.ts`  
**Asset folder:** `public/brand/logo/`  
**Entry point for UI:** `getBrandAssetById()`, `getLockupForTheme()`, `getSymbolForTheme()` – no direct file paths in components.

---

## 1. Approved variants

| Variant | Use case | TM |
|--------|----------|-----|
| **Symbol only** | App icon, favicon, compact nav, mobile header, splash | No – exclude from symbol-only |
| **Symbol + wordmark lockup** | Product nav, auth, footer, onboarding | Per asset; see TM section |
| **Tagline lockup** | Marketing only (landing, campaigns). Not in dense product UI | Per asset |

Use the variant that matches the surface and size. Do not create ad hoc combinations (e.g. wordmark without symbol) unless added to the manifest and approved.

---

## 2. Clear space and minimum size

**Clear space (token-based):**  
Minimum clear space around the logo = **half the height of the lockup (or symbol)**. Use spacing token: e.g. `padding: var(--vc-space-4)` or `margin: 0.5em` relative to logo height. No other logos, text or UI should sit inside this zone.

**Minimum sizes (recommended in manifest; use in layout):**

| Surface | Lockup min height | Symbol-only min | Notes |
|---------|-------------------|------------------|--------|
| Mobile header | 24px | 24px | Symbol-only acceptable for very narrow nav |
| Auth / onboarding | 32px | – | Prefer full lockup |
| Splash / loading | 40px | 32px | Centered; lockup or symbol |
| Footer / legal | 24px | – | Lockup preferred |
| Favicon / app icon | – | 16px–32px | Symbol only; no TM |
| Product top nav (desktop) | 32px | – | Lockup preferred |

Smaller than minimum harms recognition and may violate trademark usage. Do not scale below recommended min without approval.

---

## 3. Background usage

**Preferred (current brand style):**  
- **Dark background** – use lockup/symbol **dark** variant. Ensures visibility and matches brand presentation where the mark is light/white on dark.

**Acceptable:**  
- **Light background** – use **light** variant (dark mark on light). Product UI (e.g. white nav) typically uses light variant.

**Contrast and visibility:**  
- Ensure contrast ratio meets WCAG 2.1 AA for the logo as a whole (or treat as large graphical object per WCAG). Do not place the logo on low-contrast or busy backgrounds where it becomes hard to see. If only one variant is supplied, document in manifest and use only on backgrounds that meet contrast for that variant.

---

## 4. Placement guidance

| Surface | Recommended | Avoid |
|---------|-------------|--------|
| **App nav / header** | Lockup (symbol + wordmark) at recommended min height; left-aligned | Tagline in nav; symbol-only unless space forces it |
| **Authentication** | Lockup on auth screens; centered or top | Tagline in form area; tiny logo |
| **Legal pages** | Lockup in footer; full "VillageCircle360" naming | Module names replacing master brand in legal identity |
| **Marketing** | Tagline lockup acceptable on hero/landing | Tagline in operational product UI |
| **Product UI (dashboards, forms)** | Lockup in header; no tagline in dense areas | Tagline where it harms clarity; logo as decorative filler |
| **Splash / loading** | Lockup or symbol, centered | Clutter around logo |

---

## 5. TM placement guidance

- **If TM is part of the supplied asset:**  
  - **When to show TM:** Legal pages, marketing, onboarding where the full brand is presented and size allows readable TM.  
  - **When to omit TM:** Compact product UI (nav, in-app headers), favicon, app icon, symbol-only use, any size where TM would be unreadable or look inconsistent.  
- **Minimum readable TM:** Do not scale the lockup so small that the TM is illegible. If in doubt, use a variant without TM (e.g. symbol-only) for small sizes.  
- **Consistency:** Do not manually retype or reposition TM. Use only approved assets; if a no-TM variant is needed for small use, add it to the manifest and use that file.  
- **Favicon / app icon:** TM is **excluded** from favicon and app icon. Use symbol-only asset without TM.

---

## 6. Logo-to-system visual language (icon/badge/module identity)

Later icon, badge and module identity work should **harmonise** with the logo without copying it:

- **Curvature / softness:** Align corner and curve feel with the logo (e.g. soft rounds vs sharp) so UI icons feel part of the same family.  
- **Stroke feel / thickness:** Use a consistent stroke weight family (e.g. 1.5–2px equivalent) so icons do not look heavier or lighter than the mark.  
- **Corner radius:** Apply similar radius tendencies (e.g. rounded squares for app icons) where it supports recognition.  
- **Geometric proportion:** Keep proportions and spacing rhythm (e.g. 4px grid) so the system feels coherent.  
- **Restraint in gradient:** If the logo uses a gradient, do not force gradient onto all UI icons. Use gradient only where it supports brand moments; keep functional icons flat or single-tone where possible.  
- **Logo as anchor:** The logo is the brand anchor. Functional icons (actions, nav, status) are **not** replaced by the VC logo mark; use the mark for identity only (header, auth, splash, footer).

**Notes for next phase (icon, badge, module identity):** Use this spec as the anchor. Icon set should align stroke weight and corner language with the logo; module badges (VC Save, VC Hub, VC Grow) use colour and label from the design system, not the logo mark. Favicon and app icon must use symbol-only from the manifest; no TM in small sizes. **Platform branding (favicon, PWA, app icon, splash):** see `docs/APP_ICON_FAVICON_BRANDING.md`, `docs/SPLASH_LOADING_BRANDING.md`, and `lib/brand/platform-branding.ts`.

---

## 7. App icon and favicon adaptation

**Symbol-only use:**

- **App icon safe area:** Keep the symbol within ~80% of the icon canvas (e.g. 1024×1024) so cropping on devices does not clip the mark.  
- **Favicon:** Simplify to symbol-only; 16×16, 32×32. No TM. Prefer single colour or two-tone for clarity at small size.  
- **Avoid:** Tiny TM in favicon or app icon; complex detail that disappears at 16px.  
- **Monochrome fallback:** Have a monochrome (e.g. white on dark, dark on light) symbol version for launchers and systems that strip colour.  
- **Dark/light launcher:** If the OS supports light/dark icon variants, use symbol-light for light surfaces and symbol-dark for dark surfaces where supplied.

---

## 8. Example usage surfaces

Reference these for consistent application (see also `/design-system/logo` example page):

1. **Product top nav:** Lockup (symbol + wordmark), left; min height 32px; clear space.  
2. **Mobile header:** Symbol-only or compact lockup when space is tight; min 24px.  
3. **Login screen:** Lockup centered above form; 32px min height.  
4. **Module card area:** Master brand (lockup or wordmark) with VC Save / VC Hub / VC Grow as **labels**, not as replacement for the master logo.  
5. **Legal page footer:** Lockup at 24px min; full "VillageCircle360" naming.  
6. **Splash / loading:** Lockup or symbol centered; 40px lockup or 32px symbol.

---

## 9. Guardrails and "do not" list

- **Do not** stretch or compress the logo (keep aspect ratio).  
- **Do not** alter colours without an approved variant (use only manifest assets).  
- **Do not** apply shadows or glows inconsistently (if at all, define in this spec).  
- **Do not** place the logo on low-contrast backgrounds.  
- **Do not** use the tagline in dense operational UI where it harms clarity.  
- **Do not** replace functional action icons (e.g. back, submit, settings) with the VC logo mark.  
- **Do not** import or reference logo files outside the manifest and `public/brand/` (use `getBrandAssetById` / `getLockupForTheme` / `getSymbolForTheme` only).

---

## 10. Integration with next phase (icon, badge, module identity)

- **Icons:** Use the same stroke weight and corner/curve language as the logo; do not duplicate the logo as an icon.  
- **Badges:** Module badges (VC Save, VC Hub, VC Grow) use colour and label; the master logo remains separate (lockup in header/footer).  
- **Module identity:** Module names are typographic/label; the master logo is the single visual anchor for "VillageCircle360". Align proportions and spacing with the token system (see TOKENS.md) and this spec.
