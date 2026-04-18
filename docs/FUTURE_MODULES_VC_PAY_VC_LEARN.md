# Future modules – VC Pay & VC Learn (placeholders)

Placeholder config, copy namespaces, and design guidance for VC Pay and VC Learn. **Not available in MVP.** Do not expose as available or imply regulated capabilities.

## 1. Copy namespaces (vcPay.* / vcLearn.*)

In code, keys use prefix **`pay_`** and **`learn_`** (namespace `placeholders` in `lib/copy/namespaces.ts`). For docs we refer to vcPay.* / vcLearn.*.

| Key | Use | Do not imply |
|-----|-----|--------------|
| `pay_comingLater` / `learn_comingLater` | Inline "coming in a later release" | Current availability |
| `pay_comingSoon` / `learn_comingSoon` | Short label "Coming in a later release" | Launch date or "available soon" |
| `pay_cardTitle` / `learn_cardTitle` | Card heading (e.g. "VC Pay") | Active product |
| `pay_cardDescription` / `learn_cardDescription` | Card body on dashboard/roadmap | That the feature is live |
| `pay_roadmapDescription` / `learn_roadmapDescription` | Roadmap or info surface only | Regulated capabilities |

All placeholder copy must state "Not available in this release" or "coming in a later release". See `lib/brand/do-not-say.ts` for prohibited phrases (e.g. "VC Pay is available").

## 2. "Coming soon" UI patterns

- **Surfaces:** Roadmap, coming_soon, or (if feature-flagged) dashboard as **non-interactive** cards only.
- **Visual:** Muted styling (gray background, gray text); `ModuleBadge` with `variant="comingSoon"`. No primary accent or prominent CTA.
- **Interaction:** Cards or list items for Pay/Learn are **not** clickable as primary actions. No "Open VC Pay" or href to `/pay`/`/learn`. Link to roadmap or info only, or no link.
- **Copy:** Use `getCopy(COPY_KEYS.pay_comingSoon)` / `learn_comingSoon` and card title/description keys. Do not use "Launch" or "Available now".

## 3. Feature-flag and config

- **Nav:** Only MVP modules (save, hub, grow) appear in nav. **No `/pay` or `/learn` routes** in `nav-maps.ts` by default. Guardrail: `NAV_MODULE_IDS` in `lib/brand/module-visibility.ts`.
- **Dashboard:** By default, dashboard shows only MVP cards. Optional: set `NEXT_PUBLIC_SHOW_LATER_MODULES_ON_DASHBOARD=true` to show Pay and Learn as **non-interactive** coming-soon cards (no routes).
- **Config:** `lib/brand/architecture.ts` – Pay and Learn have `status: 'LATER'`, `allowedUISurfaces: ['roadmap', 'coming_soon']`. Use `mayShowModuleOnSurface(moduleId, surface)` and `getDashboardCardModuleIds()` from `lib/brand/module-visibility.ts`.

## 4. Future copy and design guidance (no MVP commitment)

**VC Pay (when released)**  
- Scope: Merchant QR, POS, collections, invoices.  
- Wording: Distinguish platform role (e.g. recordkeeping vs payment execution) per jurisdiction. Do not imply regulated payment or e-money in MVP placeholder copy.

**VC Learn (when released)**  
- Scope: Short courses – money, business, agri, digital safety education.  
- Wording: Educational content clearly non-advice unless otherwise regulated. Do not imply regulated advice in MVP placeholder copy.

Placeholder copy in MVP must **not** promise or imply these capabilities.

## 5. Dashboard example (future modules as coming-soon)

When `NEXT_PUBLIC_SHOW_LATER_MODULES_ON_DASHBOARD=true`, dashboard can render:

1. **MVP cards:** Save, Hub, Grow – clickable, normal styling.  
2. **LATER cards:** Pay, Learn – use `pay_cardTitle`, `pay_cardDescription`, `learn_*`; render with `ModuleBadge variant="comingSoon"`; **no** `href` to `/pay` or `/learn`; optional "Coming in a later release" link to roadmap.

Example pattern (pseudo):

```ts
const cardModuleIds = getDashboardCardModuleIds();
cardModuleIds.map((id) => (
  isLaterModule(id)
    ? <ComingSoonCard key={id} title={getCopy(COPY_KEYS[`${id}_cardTitle`])} description={getCopy(COPY_KEYS[`${id}_cardDescription`])} />
    : <ModuleCard key={id} moduleId={id} href={...} />
))
```

## 6. Tokens and badges

- **Tokens:** `lib/design-system/tokens/module-accents.ts` – `vcPay` and `vcLearn` exist for roadmap/coming-soon use; use **muted** treatment for LATER in MVP (do not use accent as primary).
- **Badges:** `ModuleBadge moduleId="pay" variant="comingSoon"` – see `lib/design-system/badges/config.ts` and `docs/ICON_BADGE_MODULE_IDENTITY.md`.

## 7. Testing and guardrails

- LATER modules are marked `status: 'LATER'` in `BRAND_MODULE_CONFIG`.
- Nav and routed module IDs are MVP-only by default (`NAV_MODULE_IDS`, `ROUTED_MODULE_IDS`).
- Tests can assert no `/pay` or `/learn` in `MEMBER_NAV`/`TREASURER_NAV`/`ADMIN_NAV` items.
- Coming-soon examples (e.g. design-system badges page) render Pay/Learn as non-interactive.
