# VillageCircle360 app icon and favicon branding

Platform branding for web favicon, PWA icons, and app launcher icons (iOS/Android) using the approved VillageCircle360 master logo. Adaptation rules only; no logo redesign.

**Spec:** `lib/brand/platform-branding.ts` (PLATFORM_BRANDING_SPEC)
**Logo source:** `lib/brand/logo-manifest.ts`
**Related:** `docs/LOGO_USAGE.md`, `docs/SPLASH_LOADING_BRANDING.md`

---

## 1. Platform branding asset categories

The machine-readable spec in `platform-branding.ts` defines: favicon (web), pwa-icon (pwa), app-icon (ios/android), splash (web/ios/android), loading-mark (web), monochrome (web). Each entry includes id, platform, assetType, sourceVariant, themeSupport, backgroundStyle, minSizePx, exportSizes, tmIncluded, filePath, notes. Favicon and app icon entries have tmIncluded false and sourceVariant symbol-only.

---

## 2. App icon adaptation rules (symbol-only)

- Use the VC symbol mark only for launcher icons and favicons. No wordmark, no tagline.
- Safe area: Keep the symbol within ~80% of the icon canvas (e.g. 1024x1024). Padding prevents cropping on device masks.
- Corner radius: Do not bake rounded corners into the export unless a platform requires it. Let the OS apply the mask.
- Small-size simplification: At 16px and 32px, avoid fine detail that blurs. Prefer single colour or two-tone; avoid gradients that reduce clarity.
- Background: Prefer flat solid for app icons (token-based dark or light). For favicon, transparent is acceptable.
- Monochrome fallback: Use monochrome symbol from the manifest when the system forces a single colour.

---

## 3. Favicon and web icon system

- Favicon base: 16x16, 32x32 (multi-size ICO or single 32x32). Symbol-only; no tagline, no wordmark, no TM.
- PWA install icons: 192x192 and 512x512. Symbol-only; solid background. Maskable: 512x512 with symbol in ~80% safe zone.
- Dark/light: One favicon acceptable for MVP. Document fallback if only one asset exists.
- Usage: No tagline in favicon; no wordmark in small icon sizes; symbol contrast must remain readable on browser tabs.

---

## 4. Theme variants and background guidance

- Dark-first: Preferred where aligned with logo usage. Use dark symbol/lockup on token-based dark background.
- Light: Use light symbol/lockup on light token-based background.
- Contrast: Meet WCAG 2.1 AA. Use fallback solid background when needed.
- Monochrome: Use when OS or context strips colour; shape is primary identifier.

---

## 5. Guardrails and do-not rules

- Do not use wordmark in favicon sizes.
- Do not include TM in favicon or launcher icon.
- Do not stretch or crop the symbol unsafely.
- Do not place the symbol on low-contrast or patterned backgrounds.
- Do not use gradients that reduce icon clarity at small sizes.
- Do not create per-module launcher icons for MVP; use master brand icon only.

---

## 6. Central asset entry points

Use getPlatformBrandingById(id) and getPlatformBrandingAssetUrl(spec) or declared filePath. For logo-derived assets use getSymbolForTheme(), getLockupForTheme(), getBrandAssetById() from logo-manifest.ts. No ad hoc logo imports.

---

## 7. References

Manifest: lib/brand/logo-manifest.ts. Platform spec: lib/brand/platform-branding.ts. Example surfaces: /design-system/logo
