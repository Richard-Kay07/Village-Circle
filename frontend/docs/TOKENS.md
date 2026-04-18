# VillageCircle360 design tokens

Foundational design tokens for UK MVP/V1: core primitives, semantic tokens, module accents (VC Save, VC Hub, VC Grow, VC Pay, VC Learn), and financial/notification status. Light theme implemented; dark theme planned.

---

## 1. Token structure

| Layer | Path | Purpose |
|-------|------|--------|
| **Primitives** | `tokens.primitives` | Raw palette, typography scale, spacing, radius, shadow, border, z-index, motion |
| **Semantic** | `tokens.semantic` | Surface, text, border, action (primary/secondary/ghost/danger), success/warning/error/info, focus, disabled |
| **Module** | `tokens.module` | `vcSave`, `vcHub`, `vcGrow`, `vcPay`, `vcLearn` – accent colour and bg |
| **Status** | `tokens.status` | recorded, pending, approved, overdue, reversed, failed, delivered |

**Backward compatibility:** `tokens.color`, `tokens.space`, `tokens.font`, `tokens.radius`, `tokens.shadow` remain for existing components.

---

## 2. Core tokens (primitives)

- **Color palette:** gray, blue, green, amber, red, teal, violet, orange, sky (numeric scales).
- **Typography:** fontFamily, fontSize (xs–3xl), fontWeight, lineHeight, letterSpacing.
- **Spacing:** 0–16 (4px base, e.g. 4 = 1rem).
- **Radius:** sm, md, lg, xl, full.
- **Shadow:** xs, sm, md, lg, focus.
- **Border width:** 0, 1, 2.
- **Z-index:** base, dropdown, sticky, overlay, modal, popover, toast.
- **Motion:** duration (fast/normal/slow), easing (default, inOut, out).
- **Touch target:** touchTargetMin 44px.

---

## 3. Semantic tokens

Use these in UI instead of raw primitives:

- **surface:** default, muted, subtle.
- **background:** default, page.
- **text:** primary, secondary, muted, disabled, inverse.
- **border:** default, strong, subtle.
- **action:** primary, secondary, ghost, danger (bg, bgHover, text, border).
- **success / warning / error / info:** bg, text, border, icon.
- **focus:** ring, ringOffset, color.
- **disabled:** opacity, cursor, bg, text, border.

**Accessibility:** Semantic pairs (e.g. success.text on success.bg) are chosen for readable contrast. Focus ring is visible; use `:focus-visible` with `tokens.semantic.focus`.

---

## 4. Module accent aliases

- **module.vcSave** – teal (MVP).
- **module.vcHub** – violet (MVP).
- **module.vcGrow** – amber (MVP).
- **module.vcPay** – orange (placeholder).
- **module.vcLearn** – sky (placeholder).

Each has: `default`, `muted`, `bg` (tint), `textOnAccent`.

**Usage guidance:**

- Use accents with restraint: module cards, rails, small badges, section accents. Do not overpower core trust UI.
- Do **not** use module accents for primary CTAs or destructive actions; use `semantic.action.primary` or `semantic.action.danger`.

---

## 5. Status tokens (financial / notifications)

- **recorded, approved, delivered** – green (success family).
- **pending** – amber (warning family).
- **overdue, failed** – red (error family).
- **reversed** – gray (neutral).

Each status has: `bg`, `text`, `border`. Always pair with icons and text labels; do not rely on colour alone.

---

## 6. Light / dark support

- **Current:** Light theme only. All CSS custom properties are set in `:root` in `app/globals.css`.
- **Plan:** Add `[data-theme="dark"]` or `.dark` with overrides for semantic and status tokens; keep primitives or redefine for dark. Module accents can stay or be slightly adjusted for contrast.

---

## 7. CSS custom properties

Use `var(--vc-*)` in styles. Examples:

- `var(--vc-color-primary)` `var(--vc-semantic-text-primary)` `var(--vc-module-vcSave)` `var(--vc-status-recorded-bg)`
- `var(--vc-space-4)` `var(--vc-radius-lg)` `var(--vc-shadow-md)` `var(--vc-font-size-base)` `var(--vc-touch-target-min)`

---

## 8. Example usage

### Module card

```tsx
import { tokens } from '@/lib/design-system/tokens';

// VC Save card – accent as left border or badge
<div style={{
  background: tokens.semantic.surface.default,
  borderLeft: `4px solid ${tokens.module.vcSave.default}`,
  borderRadius: tokens.primitives.radius.lg,
  padding: tokens.primitives.spacing[4],
  boxShadow: tokens.primitives.shadow.sm,
}}>
  <span style={{ color: tokens.module.vcSave.default, fontWeight: 600 }}>VC Save</span>
  <p style={{ color: tokens.semantic.text.secondary, marginTop: tokens.primitives.spacing[2] }}>Savings & statements</p>
</div>
```

### Status badge

```tsx
// Recorded – pair with label
<span style={{
  backgroundColor: tokens.status.recorded.bg,
  color: tokens.status.recorded.text,
  border: `1px solid ${tokens.status.recorded.border}`,
  padding: `${tokens.primitives.spacing[1]} ${tokens.primitives.spacing[2]}`,
  borderRadius: tokens.primitives.radius.sm,
  fontSize: tokens.primitives.typography.fontSize.xs,
}}>
  Recorded
</span>
```

### Confirm dialog (danger)

```tsx
// Use semantic.action.danger for destructive confirm
<button style={{
  backgroundColor: tokens.semantic.action.danger.bg,
  color: tokens.semantic.action.danger.text,
  border: `1px solid ${tokens.semantic.action.danger.border}`,
  padding: `${tokens.primitives.spacing[2]} ${tokens.primitives.spacing[4]}`,
  borderRadius: tokens.primitives.radius.md,
  minHeight: tokens.primitives.touchTargetMin,
}}>
  Delete
</button>
```

### Warning banner

```tsx
<div style={{
  backgroundColor: tokens.semantic.warning.bg,
  color: tokens.semantic.warning.text,
  border: `1px solid ${tokens.semantic.warning.border}`,
  padding: tokens.primitives.spacing[4],
  borderRadius: tokens.primitives.radius.md,
}}>
  Please complete your profile before applying.
</div>
```

---

## 9. Do not

- Hardcode ad hoc colours in component files; use tokens or CSS vars.
- Use module accents for destructive actions (use `semantic.action.danger`).
- Rely on status colour alone; always pair with icons and text labels.
