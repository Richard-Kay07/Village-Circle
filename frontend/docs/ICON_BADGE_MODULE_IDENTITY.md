# VillageCircle360 icon, badge and module identity patterns

UK MVP/V1 patterns derived from the master logo visual language. The VC mark + wordmark is the brand anchor; icons and badges harmonise in curvature, stroke and proportion without copying the logo.

**Logo rules:** `docs/LOGO_USAGE.md`  
**Tokens:** `lib/design-system/tokens` (module accents, status)  
**Badge components:** `components/ui/ModuleBadge`, `StatusBadge`, `ChannelBadge`, `TransactionModeBadge`

---

## 1. Brand anchor requirement

- Use the VillageCircle360 logo (VC mark + wordmark) as the **master visual reference**.
- Derive badge and module identity styling from the logo: **curvature**, **stroke feel**, **softness**, **proportion**.
- Keep **functional UI icons** simple and distinct; they support actions and navigation, not brand identity.
- Logo usage (dark backgrounds, symbol-only, lockups, minimum size, clear space, TM): follow `docs/LOGO_USAGE.md`. Do not redraw or distort the logo.

---

## 2. Icon usage rules

- **One primary icon per major action or surface** so users learn a single metaphor (e.g. one "savings" icon for VC Save flows, one "loan" icon for VC Grow).
- **Consistent icon metaphors:**
  - **Savings / contributions:** Piggy bank, coin stack, or receipt/document (record of payment). Avoid generic "bank" building icon for non-bank actions; prefer "savings" or "contribution record".
  - **Groups / governance:** People, circle/ring, or meeting. Use for VC Hub (meetings, approvals, share-out).
  - **Loans:** Handshake, arrow (disbursement/repayment), or document (agreement). Use for VC Grow (application, approval, repayment).
  - **Alerts / notifications:** Bell or flag. Pair with status colour; do not rely on colour alone.
  - **Evidence:** Paperclip, document, or image. Use for evidence/attachments.
  - **Audit:** List, clock, or timeline. Use for audit log and trace.
- **Avoid ambiguous "bank" iconography** for actions that are recordkeeping only (e.g. "contribution recorded", "repayment recorded"). If a bank-like icon is used, contextualise with label (e.g. "Bank transfer" for transaction mode, not for "Save" or "Record").
- Align icon **stroke weight** and **corner/curve** with the logo (soft rounds, consistent weight). Do not use the VC logo mark as a functional action icon.

---

## 3. Badge and chip component specs

### 3.1 ModuleBadge (VC Save / VC Hub / VC Grow / Coming Soon)

- **MVP modules:** VC Save, VC Hub, VC Grow. Use module accent (teal, violet, green) for background/border; label from `getBrandModuleConfig(id).displayName` or `shortLabel`.
- **Coming Soon:** VC Pay, VC Learn. Use **muted** styling (gray background, gray text); label "Coming soon" or "VC Pay – Coming soon". Do **not** use primary accent or enabled-state styling so they are clearly unavailable.
- **Casing:** Title case for display names (VC Save, VC Hub). Short labels (Save, Hub, Grow) for narrow screens.
- **Spec:** `ModuleBadge` component; prop `moduleId` + optional `variant: 'default' | 'comingSoon'`. Coming Soon always uses muted tokens and is not interactive as a primary action.

### 3.2 StatusBadge (Recorded, Reversed, Overdue, Failed, Delivered, etc.)

- **Taxonomy:** `recorded`, `pending`, `approved`, `overdue`, `reversed`, `failed`, `delivered` (from `statusTokens`). Pair with icons/labels; do not rely on colour alone.
- **Labels:** Sentence case or title case per copy (e.g. "Recorded", "Reversed", "Overdue", "Failed", "Delivered"). Short labels for narrow: "Recorded" → "Done", "Overdue" → "Overdue", "Pending" → "Pending".
- **Spec:** `StatusBadge` component; prop `statusId` (keyof statusTokens). Uses `tokens.status[id]` for bg, text, border.

### 3.3 ChannelBadge (In-app, Email, SMS)

- **Taxonomy:** `in_app`, `email`, `sms`. Used on notifications and delivery context.
- **Labels:** "In-app", "Email", "SMS". Short: "App", "Email", "SMS".
- **Spec:** `ChannelBadge` component; prop `channelId`. Neutral/muted styling (gray or semantic muted) unless a channel token set is added; keep distinct from status colours.

### 3.4 TransactionModeBadge (Cash, Bank transfer)

- **Taxonomy:** `CASH`, `BANK_TRANSFER` (align with API/enum).
- **Labels:** "Cash", "Bank transfer". Short: "Cash", "Bank".
- **Spec:** `TransactionModeBadge` component; prop `mode: 'CASH' | 'BANK_TRANSFER'`. Neutral styling (e.g. gray or subtle blue/gray) so it is not confused with status (success/error).

---

## 4. Badge label casing and short labels

- **Casing:** Module names: Title case (VC Save, VC Hub). Status: Title case (Recorded, Pending). Channel: Title case (In-app, Email, SMS). Transaction mode: Sentence style (Cash, Bank transfer).
- **Short labels (narrow screens):** Config in `lib/design-system/badges/config.ts`. Use `shortLabel` when space is limited (e.g. table cells, mobile cards). Example: "Bank transfer" → "Bank"; "Coming soon" → "Soon".

---

## 5. Coming soon (VC Pay, VC Learn) – copy and visual rules

- **Do not** present VC Pay or VC Learn as enabled or available. Use **muted** visual treatment: gray background, gray text, no primary accent, no prominent CTA.
- **Copy:** "Coming soon", "VC Pay – Coming soon", "VC Learn – Coming soon". Optional: "Not available in this release." Do not use "Launch" or "Available soon" in a way that implies the feature is active.
- **Interaction:** Cards or list items for Pay/Learn are **not** clickable as primary actions (e.g. no "Open VC Pay"). Use disabled or secondary styling; link to roadmap or info only.
- **Do not** infer feature availability from colour alone: Coming Soon badges must look clearly inactive (muted) even to colour-blind users.

---

## 6. Example usage contexts

- **Dashboard cards:** ModuleBadge (VC Save, VC Hub, VC Grow) on each card; Coming Soon cards with ModuleBadge variant comingSoon.
- **Loan list rows:** StatusBadge (e.g. Approved, Overdue), optional TransactionModeBadge on repayment rows.
- **Contribution rows:** StatusBadge (Recorded, Reversed), TransactionModeBadge (Cash, Bank transfer).
- **Notifications list:** ChannelBadge (In-app, Email, SMS); optional StatusBadge (Delivered, Failed).
- **Admin trace / timeline:** StatusBadge and ChannelBadge where relevant; EvidenceBadge for evidence presence.

---

## 7. References

- Logo: `docs/LOGO_USAGE.md`, `lib/brand/logo-manifest.ts`
- Tokens: `lib/design-system/tokens` (module accents, status)
- Brand modules: `lib/brand/architecture.ts` (getBrandModuleConfig, MVP_MODULE_IDS, LATER_MODULE_IDS)
- Badge config: `lib/design-system/badges/config.ts`
- Design system examples: `/design-system/badges` (or tokens page badge section)
