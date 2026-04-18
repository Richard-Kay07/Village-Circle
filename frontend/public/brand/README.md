# VillageCircle360 brand assets

Place **approved** master logo and related assets here. Do not redraw, distort or replace with unapproved artwork.

## Folder structure (align with manifest)

- `logo/` – master logo files referenced by `lib/brand/logo-manifest.ts` and `lib/brand/platform-branding.ts`
  - `villagecircle360-lockup-light.svg` – symbol + wordmark, light background
  - `villagecircle360-lockup-dark.svg` – symbol + wordmark, dark background
  - `villagecircle360-symbol-light.svg` – symbol only, light
  - `villagecircle360-symbol-dark.svg` – symbol only, dark
  - `villagecircle360-tagline-lockup-light.svg` – lockup + tagline (marketing)
  - `favicon.ico` – favicon export (symbol-only, no TM). Required for web; 16×16 / 32×32.
  - `app-icon-1024.png` – app icon source (symbol-only, 1024×1024). Export iOS/Android and PWA sizes from this.
  - `pwa-icon-192.png`, `pwa-icon-512.png`, `pwa-maskable-512.png` – PWA install icons (when PWA enabled)
  - `symbol-monochrome-light.svg`, `symbol-monochrome-dark.svg` – monochrome fallbacks (optional)

If only one variant is supplied, document in manifest `usageNotes` and in `docs/LOGO_USAGE.md`.

## Platform branding

Favicon and app icon must be **symbol-only**; no wordmark, no TM. See `docs/APP_ICON_FAVICON_BRANDING.md` and `docs/SPLASH_LOADING_BRANDING.md`. Asset spec: `lib/brand/platform-branding.ts`.

## Rules

- All logo usage in the app must reference the manifest (`getBrandAssetById`, `getLockupForTheme`, `getSymbolForTheme`). Do not import or reference logo files outside this folder and manifest.
- Do not add unapproved or modified versions. New variants must be added to the manifest and usage spec.
