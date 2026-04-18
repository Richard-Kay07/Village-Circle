# SMS Implementation Completeness Report (UK MVP/V1)

Audit of the SMS notifications implementation against the specification.

---

## 1. Provider abstraction ✅

- **Requirement:** Build provider abstraction first; do not hard-code provider across domain services.
- **Status:** **Done.** `ISmsProviderAdapter` in `sms/sms-provider.interface.ts` defines `send(to, message, metadata)` and `parseWebhook(payload, headers)`. Domain uses `SmsDispatcher`, which depends only on this interface. No provider-specific code in notification service.

---

## 2. SmsDispatcher (send + parseWebhook) ✅

- **Requirement:** Implement SmsDispatcher with `send(to, message, metadata)` and `parseWebhook(payload, headers)`.
- **Status:** **Done.** `dispatchers/sms.dispatcher.ts` implements `ISmsDispatcher`: `dispatch(target, rendered, notificationId)` calls `adapter.send(target.phone, rendered.body, { notificationId })` and `parseWebhook` delegates to the adapter. The public API is `dispatch` (channel-agnostic) but the adapter interface exposes `send(to, message, metadata)` as specified.

---

## 3. Webhook endpoint and status mapping ✅

- **Requirement:** Webhook endpoint/service for DELIVERED, FAILED, UNDELIVERABLE, SENT/ACCEPTED.
- **Status:** **Done.** `SmsWebhookController` and `SmsWebhookService` are registered in `NotificationsModule`; `SMS_PROVIDER_ADAPTER` is provided with `MockSmsAdapter`. Route POST `notifications/sms/webhook` is exposed. `mapToInternalStatus` maps DELIVERED→DELIVERED, SENT/ACCEPTED→SENT, FAILED/UNDELIVERABLE→FAILED.

---

## 4. Webhook processing (signature, map status, audit) ✅

- **Requirement:** Validate provider signature if available; map to internal statuses; emit audit with `channel = SMS_WEBHOOK`.
- **Status:** **Done.** Adapter’s `parseWebhook` can set `signatureInvalid` (mock adapter does when `x-mock-signature: invalid`). Service maps status and updates notification; appends audit with `channel: AuditChannel.SMS_WEBHOOK`, `action: 'SMS_WEBHOOK_DELIVERY_STATUS'`.

---

## 5. User/tenant controls ✅

- **Requirement:** Tenant flag `smsNotificationsEnabled`; per-user opt-out for non-critical; receipt confirmation default tenant-configurable.
- **Status:** **Done.** `NotificationPreferenceService` implements `isChannelAllowed` for SMS: (a) uses `GroupRulesService.getSnapshotForLoan(tenantGroupId, new Date())` and requires `smsNotificationsEnabled`, (b) for template keys in `RECEIPT_CONFIRMATION_TEMPLATE_KEYS` requires `smsReceiptConfirmationEnabled`, (c) loads member by `recipientMemberId` (or resolves from `recipientUserId`) and blocks when `member.smsOptOut` is true. `NotificationService.send` passes `templateKey` in context.

---

## 6. Failure handling ✅

- **Requirement:** Retry policy for retryable failures; dead-letter/failed marker when retries exhausted; admin-visible failure reason.
- **Status:** **Done.** `NotificationService.send` uses `MAX_RETRIES = 3`; on dispatch failure sets status to FAILED when `retryCount >= MAX_RETRIES`, otherwise QUEUED for retry. `errorCode` and `errorMessage` stored on Notification (admin-visible). No separate “dead-letter” name; FAILED with retries exhausted is the effective marker.

---

## 7. RBAC for manual resend/retry ✅

- **Requirement:** Privileged manual resend/retry requires capability and audit log.
- **Status:** **Done.** `Permission.NOTIFICATION_RESEND` added; assigned to PLATFORM_ADMIN, GROUP_CHAIR, GROUP_TREASURER. `retry(notificationId, actorUserId)` logs `NOTIFICATION_RETRY_REQUESTED` when `actorUserId` provided. Callers (e.g. admin retry endpoint) must enforce `NOTIFICATION_RESEND` before calling `retry` with an actor.

---

## 8. Privacy/safety ⚠️ Not implemented

- **Requirement:** Do not include sensitive financial amounts in SMS by default unless template explicitly allowed; prefer concise messages with link/app prompt.
- **Status:** **Not implemented.** No code or template convention prevents amount variables in SMS templates. No “allow amounts” flag on templates. Should be documented and/or enforced (e.g. template metadata or README + examples without amounts).

---

## 9. Testing ✅

- **Required:** Send SMS success via mock adapter; webhook status mapping; invalid signature rejected; tenant SMS disabled blocks send; user opt-out blocks non-critical; manual resend audit; failed SMS retry path.
- **Status:**
  - **notification.service.spec.ts:** Retry path and audit (`NOTIFICATION_RETRY_REQUESTED`); failed dispatch and max retries; **tenant SMS disabled blocks send** (CANCELLED when `smsNotificationsEnabled` false); **user opt-out blocks non-critical SMS** (CANCELLED when `member.smsOptOut` true). Module now provides `GroupRulesService` mock and `SMS_PROVIDER_ADAPTER` (MockSmsAdapter).
  - **sms.dispatcher.spec.ts:** **Send SMS success** through mock adapter (dispatch with phone, body, notificationId); empty phone returns NO_PHONE; **invalid webhook signature** rejected via adapter; parseWebhook returns payload when valid.
  - **sms-webhook.service.spec.ts:** **Webhook status mapping** (DELIVERED→DELIVERED, SENT→SENT, FAILED→FAILED with errorCode/errorMessage); **invalid signature** returns accepted: false, signatureInvalid: true; audit with channel SMS_WEBHOOK; no notification found accepted without update.

---

## 10. Output (adapter interface + mock, example templates) ✅

- **Requirement:** Show provider adapter interface and example mock adapter; show example SMS templates for the 5 MVP use cases.
- **Status:**
  - **Adapter interface and mock:** **Done.** `sms-provider.interface.ts` and `sms/adapters/mock-sms.adapter.ts` with `send` and `parseWebhook` (including signature check).
  - **Example SMS templates:** **Done.** README section "SMS (MVP)" lists example `templateKey` and `bodyTemplate` for: meeting_reminder, contribution_due_reminder, overdue_repayment_reminder, approval_required, receipt_confirmation. Privacy note: avoid financial amounts unless tenant allows; prefer concise + link.

---

## Summary

| Area                     | Status | Notes                                                                 |
|--------------------------|--------|-----------------------------------------------------------------------|
| Provider abstraction     | Done   | `ISmsProviderAdapter`, no hard-coding in domain                       |
| SmsDispatcher            | Done   | send via adapter, parseWebhook delegated                              |
| Webhook endpoint/service | Done   | Controller + service wired; adapter provided (MockSmsAdapter)          |
| Webhook validation/audit | Done   | Signature in adapter; audit SMS_WEBHOOK                               |
| Tenant/user controls     | Done   | Preference service checks tenant + receipt flag + member smsOptOut    |
| Failure handling         | Done   | Retries, FAILED, errorCode/errorMessage                               |
| RBAC retry               | Done   | NOTIFICATION_RESEND permission; audit when actor provided             |
| Privacy (no amounts)     | Doc    | README: avoid amounts in SMS unless allowed; example templates safe  |
| Tests                    | Done   | SMS send, webhook mapping, signature reject, tenant/user blocks        |
| Example templates        | Done   | README: 5 MVP template keys and example bodyTemplate                 |

---

## Recommended next steps (completed)

1. ~~Wire module~~ Done: `SmsWebhookController`, `SmsWebhookService`, `SMS_PROVIDER_ADAPTER` (MockSmsAdapter) in `NotificationsModule`; `GroupRulesModule` imported for preference checks.
2. ~~Preference service~~ Done: `NotificationPreferenceService` implements SMS checks (tenant, receipt template, member smsOptOut).
3. ~~RBAC~~ Done: `Permission.NOTIFICATION_RESEND`, assigned to chair/treasurer/admin; callers must enforce when using `retry(..., actorUserId)`.
4. ~~Privacy/templates~~ Done: README section with privacy note and 5 example SMS templates.
5. ~~Tests~~ Done: `sms-webhook.service.spec.ts`, `sms.dispatcher.spec.ts`, and extended `notification.service.spec.ts` for tenant disabled and user opt-out.

**Remaining (optional):** Enforce NOTIFICATION_RESEND in an HTTP retry endpoint (e.g. `POST /notifications/:id/retry`) when that endpoint is added; add template metadata “allowAmounts” if you want programmatic enforcement of no-amounts in SMS.
