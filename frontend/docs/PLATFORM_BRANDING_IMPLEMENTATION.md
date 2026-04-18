# VillageCircle360 platform branding – implementation notes

Integration guidance for **Next.js (web)**, **PWA manifest**, and **Expo / React Native** (mobile) for favicon, app icons, and splash. All paths and sizes should align with `lib/brand/platform-branding.ts`.

**Spec:** `lib/brand/platform-branding.ts`  
**Logo manifest:** `lib/brand/logo-manifest.ts`

---

## 1. Next.js / web favicon and app icons

- **Favicon:** Place `favicon.ico` in `app/` (root) **or** serve from `public/` and reference in metadata. Recommended: use the spec path `public/brand/logo/favicon.ico` and set in root layout metadata so one source of truth stays under `public/brand/`.
- **Metadata (App Router):** In `app/layout.tsx`, set `metadata.icons` to point to the brand asset. Example:
  - `icons: { icon: '/brand/logo/favicon.ico' }`  
  - For multiple sizes (if you add 32px PNG): `icons: [{ url: '/brand/logo/favicon.ico', sizes: 'any' }, { url: '/brand/logo/icon-32.png', sizes: '32x32', type: 'image/png' }]`
- **Apple touch icon:** Optional; use same symbol-only asset. e.g. `apple: '/brand/logo/app-icon-1024.png'` or a 180×180 export; document in platform spec if added.
- **Central entry:** Do not duplicate favicon in `app/` and `public/brand/`; prefer a single location (e.g. `public/brand/logo/favicon.ico`) and reference via metadata to avoid drift.

---

## 2. PWA manifest icon references

If the app is or will be installable (PWA):

- **Manifest icons:** Reference the same paths as in `PLATFORM_BRANDING_SPEC`. Required sizes typically: **192**, **512**. Add a **maskable** icon (512×512) with symbol in ~80% safe zone; use `purpose: "maskable"` for that entry and `purpose: "any"` for non-maskable.
- **Example manifest snippet:**
  - `"icons": [ { "src": "/brand/logo/pwa-icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" }, { "src": "/brand/logo/pwa-icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" }, { "src": "/brand/logo/pwa-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" } ]`
- **Naming:** Align file names with spec `filePath` (e.g. `pwa-icon-192.png`, `pwa-maskable-512.png`). Generate from `app-icon-1024.png` (symbol-only, no TM).

---

## 3. Expo / React Native app icon and splash config placeholders

- **App icon:** Use the same source asset as web (`app-icon-1024.png`). Export to required sizes via Expo/asset tooling (e.g. `expo prebuild` or icon generator). Store source in `public/brand/logo/` or a shared `assets/brand/` and reference in `app.json` / `app.config.js`:
  - `expo.icon`: path to 1024×1024 source (e.g. `./assets/brand/app-icon-1024.png`).
- **Splash:** `expo.splash`: use token-based background (e.g. `#1A1C1F` for dark). Image: centered symbol or lockup; export a PNG with safe padding. Prefer `expo.splash.image` + `expo.splash.backgroundColor`; avoid baking dense text into the image.
- **Folder structure:** Suggested:
  - `assets/brand/` (or symlink/copy from `public/brand/logo/`): `app-icon-1024.png`, splash image(s).
  - Do not duplicate logo SVGs in mobile if the app uses a single PNG splash image; keep one source and document in platform spec.
- **iOS/Android export naming:** Let Expo/React Native CLI generate platform-specific folders (`ios/.../Images.xcassets`, `android/app/src/main/res/`). Source remains 1024×1024; no per-module icons for MVP.

---

## 4. iOS / Android export naming and folder structure

- **iOS:** Standard App Icon set; sizes generated from 1024×1024. Names per Apple convention (e.g. `AppIcon.appiconset`). No TM in assets.
- **Android:** `mipmap-*` or `drawable`; mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi from same 1024 source. Adaptive icon: use same graphic in foreground layer; background layer can be token-based solid colour.
- **Central asset entry:** All exports derive from `public/brand/logo/app-icon-1024.png` (or the path in `PLATFORM_BRANDING_SPEC`). Document any copy/symlink to mobile repo in this doc so teams don’t add ad hoc sources.

---

## 5. Manifest validation and file presence

- **Validation:** Tests should assert that every `PLATFORM_BRANDING_SPEC` entry has required fields (`id`, `platform`, `assetType`, `sourceVariant`, `themeSupport`, `backgroundStyle`, `tmIncluded`, `notes`). Favicon and app icon entries must have `tmIncluded === false` and `sourceVariant === 'symbol-only'`.
- **File presence:** For entries with `filePath`, a simple check can verify that the file exists under `public/` (e.g. in CI or a script). Optional: skip missing optional assets (e.g. monochrome) with a allow-list so MVP can ship with favicon + app-icon-source only.

---

## 6. References

- **Platform spec:** `lib/brand/platform-branding.ts`
- **Logo manifest:** `lib/brand/logo-manifest.ts`
- **Usage rules:** `docs/APP_ICON_FAVICON_BRANDING.md`, `docs/SPLASH_LOADING_BRANDING.md`, `docs/LOGO_USAGE.md`
