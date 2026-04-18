# Notifications and in-app operational messaging copy – UK MVP/V1

Copy keys and templates for in-app and email-ready notifications in VillageCircle360. Channel-safe phrasing: in-app can be slightly longer; SMS must be concise and avoid sensitive detail overexposure by default.

## 1. Copy namespaces

All notification copy uses the `notifications_` prefix in `frontend/lib/copy/keys.ts` and `messages.ts`.

| Namespace | Key prefix | Use |
|-----------|------------|-----|
| **notifications.common.*** | `notifications_common_*` | Empty state, error state, generic CTA, status/failure messages |
| **notifications.meeting.*** | `notifications_meeting_*` | Meeting reminder (title, body, CTA) – inApp and SMS variants |
| **notifications.contribution.*** | `notifications_contribution_*` | Due reminder and receipt confirmation – inApp and SMS variants |
| **notifications.loan.*** | `notifications_loan_*` | Overdue repayment reminder – inApp and SMS variants |
| **notifications.approval.*** | `notifications_approval_*` | Approval required and approval decision (approved/rejected) – inApp and SMS variants |
| **notifications.system.*** | `notifications_system_*` | SMS delivery failed (admin-facing) – title, body, CTA |
| **Preferences** | `notifications_preferences_*` | Preferences screen: title, empty state, error load |

## 2. Message template patterns and variables

Templates use `{variableName}` in the message string. Substitute with `getCopyTemplate(COPY_KEYS.xxx, { groupName: 'Tuesday Circle', ... })`.

| Variable | Used in | Notes |
|----------|---------|-------|
| `groupName` | meeting, contribution, loan, approval | Group display name |
| `meetingName` | meeting reminder | e.g. "March 2025" |
| `meetingDate` | meeting reminder | Formatted date |
| `amount` | contribution receipt (inApp only) | e.g. "£20.00" – avoid in SMS |
| `dueDate` | contribution due reminder | Formatted date |
| `applicantName` | approval (optional) | Not required in MVP templates |
| `outcome` | approval decision | "approved" / "rejected" |

**Fallback plain messages:** Use the same key with empty or generic vars for a safe fallback (e.g. "Contribution recorded" if `groupName` missing).

## 3. Core MVP use cases

| Use case | Title keys | Body keys | CTA key |
|----------|------------|-----------|---------|
| Meeting reminder | `_title_inApp`, `_title_sms` | `_body_inApp`, `_body_sms` | `notifications_meeting_reminder_cta` |
| Contribution due reminder | `_title_inApp`, `_title_sms` | `_body_inApp`, `_body_sms` | `notifications_contribution_dueReminder_cta` |
| Contribution receipt confirmation | `_title_inApp`, `_title_sms` | `_body_inApp`, `_body_sms` | `notifications_contribution_receipt_cta` |
| Approval required | `_title_inApp`, `_title_sms` | `_body_inApp`, `_body_sms` | `notifications_approval_required_cta` |
| Approval decision (approved/rejected) | `_decision_approved_title_*`, `_decision_rejected_title_*` | `_decision_body_approved_inApp`, `_rejected_inApp`, `_body_sms` | `notifications_approval_decision_cta` |
| Overdue repayment reminder | `_title_inApp`, `_title_sms` | `_body_inApp`, `_body_sms` | `notifications_loan_overdueReminder_cta` |
| SMS delivery failed (admin) | `notifications_system_smsDeliveryFailed_title` | `_body` | `_cta` |

## 4. Channel-safe wording

- **In-app:** Can include group name, meeting name, date, and (where appropriate) amount. Slightly longer body text is fine.
- **SMS:** Concise only. Default to "Open app for details" for sensitive or variable detail. Do not include amounts or outstanding balances in SMS by default; use "Contribution recorded" / "Overdue repayment" etc. Titles should stay short (e.g. "Approval required", "Contribution recorded").
- **Email:** Can reuse in-app variants or same template with full body.

## 5. Empty and error states

- **Notification list / centre:** `notifications_common_emptyTitle`, `notifications_common_emptyDescription`, `notifications_common_errorLoad`.
- **Preferences screen:** `notifications_preferences_emptyTitle`, `notifications_preferences_emptyDescription`, `notifications_preferences_errorLoad`.
- **Status/failure:** `notifications_common_statusSending`, `notifications_common_statusFailed`, `notifications_common_failureGeneric`.

## 6. Variable interpolation and mobile length

- Use `getCopyTemplate(key, vars)` for any key that contains `{...}` placeholders.
- **SMS length heuristic:** Single-segment SMS is typically 160 characters (GSM-7). Rendered SMS title + body for notification templates should ideally stay under 160 chars when variables are substituted with typical values (e.g. group name &lt; 30 chars, date formatted short). This is **documented as a heuristic only**; tests may assert example interpolations are under a max length (e.g. 160) for SMS variants. Backend or delivery layer may enforce final truncation.

## 7. Testing and checks

- **Copy key presence:** All MVP notification use cases have corresponding keys and non-empty messages (see `frontend/__tests__/lib/copy/notifications-copy.test.ts`).
- **Variable interpolation:** Tests assert example interpolations produce expected strings and, for SMS variants, that rendered length is under 160 chars as a heuristic check.
