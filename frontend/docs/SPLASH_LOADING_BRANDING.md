# VillageCircle360 splash and loading branding

Brand-safe patterns for **web loading**, **mobile app splash**, **auth loading**, and **app startup**. Approved assets and token-based backgrounds only.

**Spec:** `lib/brand/platform-branding.ts` (splash, loading-mark)  
**Logo:** `lib/brand/logo-manifest.ts`  
**Tokens:** `lib/design-system/tokens`  
**Related:** `docs/LOGO_USAGE.md`, `docs/APP_ICON_FAVICON_BRANDING.md`

---

## 1. Principles

- **Approved assets only:** Lockup or symbol from manifest (`getLockupForTheme`, `getSymbolForTheme`).
- **Token-based backgrounds:** Use semantic surfaces or brand dark (e.g. `#1A1C1F`). Master brand first; module-neutral.
- **Optional accent:** Subtle logo-derived accent allowed only if it does not reduce contrast.
- **No dense text on splash:** Logo plus optional one short line (e.g. "Loading…"). No paragraphs.
- **Tagline:** Only where size and context support readability; not on small loading marks.
- **Animation:** Restraint only. Simple fade or scale; avoid flashy or spinning effects.

---

## 2. Web loading state

- **Asset:** Symbol or lockup; min 40px lockup or 32px symbol. Centered.
- **Background:** Token-based (`semantic.background.page` or dark surface). Dark-first option: brand dark with dark lockup/symbol.
- **Animation:** Fade-in; optional gentle progress. No rapid motion.

---

## 3. Mobile app splash (iOS / Android)

- Full-screen splash; symbol or lockup centered. Token-based background (brand dark preferred).
- Min 40px lockup or 32px symbol. Use theme-appropriate variant.
- Export static image or runtime view; no dense text in image. Transition: simple fade to first screen (~300ms).

---

## 4. Authentication loading screen

- Lockup preferred, centered; min 32px. Same token-based background rules.
- Copy: one short line only ("Loading…" / "Signing you in…"). No tagline unless full lockup at readable size.
- Animation: fade or short progress; no spinning logo.

---

## 5. App startup transition

- Web: single splash then fade to app. Mobile: native splash then first route; avoid duplicate loading screen unless required.

---

## 6. Empty state with small brand mark

- Small symbol or compact lockup (min 24px). Token background. Inline only; not full-screen splash.

---

## 7. Animation restraint

- **Allowed:** Fade-in/out; light scale; subtle opacity; progress bar or determinate spinner.
- **Avoid:** Spinning logo; rapid flashing; parallax. Prefer simple fade/scale.

---

## 8. Token reference

- **Light:** `semantic.background.default`, `semantic.surface.default`, `semantic.surface.muted`
- **Dark:** Preferred value `#1A1C1F` (document until a dark token exists); or primitives `gray.800` / `gray.900`.

---

## 9. References

- Platform spec: `lib/brand/platform-branding.ts`
- Logo: `getLockupForTheme(theme)`, `getSymbolForTheme(theme)` from `logo-manifest.ts`
- Example: `/design-system/logo` (splash / loading section)
