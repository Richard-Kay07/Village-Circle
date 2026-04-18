# SMS template copy pack – UK MVP/V1

Concise, trust-safe SMS copy for VillageCircle360. UK English, clear action wording. Does not imply the platform moved money or executed payment.

## 1. MVP SMS use cases (required)

| Use case | Short variant key | Standard variant key | Optional |
|----------|-------------------|----------------------|----------|
| Meeting reminder | `notifications_sms_meeting_reminder_short` | `notifications_sms_meeting_reminder_standard` | — |
| Contribution due reminder | `notifications_sms_contribution_due_short` | `notifications_sms_contribution_due_standard` | — |
| Overdue repayment reminder | `notifications_sms_overdue_repayment_short` | `notifications_sms_overdue_repayment_standard` | — |
| Approval required (chair/treasurer) | `notifications_sms_approval_required_short` | `notifications_sms_approval_required_standard` | — |
| Receipt confirmation (tenant-configurable) | `notifications_sms_receipt_confirmation_short` | `notifications_sms_receipt_confirmation_standard` | `notifications_sms_receipt_confirmation_withAmount_standard` (when amount in SMS is enabled) |

## 2. Tokenized placeholders

All placeholders are documented and named consistently. Use `getCopyTemplate(COPY_KEYS.xxx, { ... })`.

| Placeholder | Description | Used in | Safe for SMS default |
|-------------|-------------|---------|----------------------|
| `{groupName}` | Group display name (or configured group label) | All templates | Yes |
| `{meetingDate}` | Meeting date, formatted short (e.g. 15 Mar 2025) | Meeting reminder | Yes |
| `{amount}` | Formatted amount (e.g. £20.00); **tenant-configurable only** | Receipt confirmation (optional variant) | Only when explicitly enabled |
| `{loanRef}` | Short loan reference; use only when tenant policy allows | Overdue/approval (optional) | Only when configured |
| `{appLink}` | Link text or URL (e.g. "Open app" or short URL); injected by backend | All templates | Yes (replace with `notifications_sms_linkOpenApp` or URL) |

Backend or sender must substitute `{appLink}` with the actual link text or URL (e.g. from `notifications_sms_linkOpenApp` or a short link). Do not send raw `{appLink}` to the user.

## 3. Short vs standard variants

- **Short:** Character-conscious; target single-segment SMS (e.g. 160 chars GSM-7). Minimal wording, no sender prefix. Use when segment cost or length is critical.
- **Standard:** Slightly longer; can include "VillageCircle360 –" for sender identification. Same placeholders; clearer action wording (e.g. "Open app to approve or reject").

## 4. Link text conventions

- `notifications_sms_linkOpenApp` – "Open app" (generic CTA).
- `notifications_sms_linkViewDetails` – "View in app" (when linking to a specific screen).

Use as the value for `{appLink}` when no URL is injected, or as fallback link text.

## 5. Consent / preference reminders (non-critical)

- `notifications_sms_consentReminder` – Shown in-app or in preferences: "You receive these reminders based on your preferences. Manage in app." Use for non-critical message types; do not overload legal wording.

## 6. Admin/operator delivery failure copy (in-app only)

Shown in admin/support UI for SMS delivery status; **not sent to end users.**

| Key | Copy | When to show |
|-----|------|--------------|
| `notifications_system_smsDeliveryFailed_statusFailed` | Failed | Delivery attempt failed |
| `notifications_system_smsDeliveryFailed_statusRetrying` | Retrying | System is retrying delivery |
| `notifications_system_smsDeliveryFailed_statusUndeliverable` | Undeliverable | Permanently undeliverable (e.g. invalid number, carrier rejection) |

Existing: `notifications_system_smsDeliveryFailed_title`, `_body`, `_cta` for the failed-delivery list screen.

## 7. SMS copy guidance

- **No jargon:** Use plain language (e.g. "Contribution recorded", not "Credit posted").
- **No legal overload:** Keep consent/preference text brief; avoid long terms in SMS.
- **Identify sender clearly:** Standard variants use "VillageCircle360 –" at the start. Where tenant policy uses a group label only, backend can use a template without the platform name or with a configured sender label.
- **Trust-safe:** Do not imply the platform moved money or executed payment. Use "recorded", "due", "repayment" (recordkeeping); avoid "we've sent", "payment executed", "transfer completed".

## 8. Testing and checks

- **Short variant length:** Short templates (with example placeholder values) should fit within common SMS constraints (e.g. ≤160 chars). See `frontend/__tests__/lib/copy/sms-copy.test.ts`.
- **Placeholder validation:** All placeholders used in SMS templates are documented in this spec and in `CopyTemplateVars`; naming is consistent (`groupName`, `meetingDate`, `amount`, `loanRef`, `appLink`).
