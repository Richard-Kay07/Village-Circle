# Notifications (VillageCircle360 UK MVP)

Notification entity, simple templates, channel dispatch (IN_APP, EMAIL, SMS), delivery status, and retry hooks.

## Models

- **Notification**: tenantGroupId, recipientUserId/recipientMemberId, channel, templateKey, payload (JSON), status (QUEUED, SENT, DELIVERED, FAILED, CANCELLED), providerMessageId, errorCode/errorMessage, timestamps (createdAt, sentAt, deliveredAt, readAt), retryCount, mandatory (skip preference check when true).
- **NotificationTemplate**: groupId (null = global), templateKey, channel, subject (optional), bodyTemplate ({{variable}} interpolation).

## Template rendering

Simple variable interpolation: `{{key}}` is replaced by `payload[key]`. Use `renderTemplate(bodyTemplate, payload)` or `renderNotification(subject, bodyTemplate, payload)`.

## Dispatch abstraction

- **InAppDispatcher**: MVP returns success (in-app feed can consume Notification records).
- **EmailDispatcher**: Stub; integrate SendGrid/SES for production.
- **SmsDispatcher**: Provider-agnostic wrapper; uses **ISmsProviderAdapter** (see `sms/sms-provider.interface.ts`). Example implementation: **MockSmsAdapter** in `sms/adapters/mock-sms.adapter.ts`. Replace with Twilio/SNS adapter for production.

## SMS (MVP)

### Provider adapter interface

- **ISmsProviderAdapter**: `send(to: string, message: string, metadata?: SmsSendMetadata)` and `parseWebhook(payload, headers)` (returns `SmsWebhookParseResult` with valid, signatureInvalid, payload). Adapter may validate provider signature in `parseWebhook`.
- **MockSmsAdapter**: Used in tests and default module wiring; supports `failNext` and `signatureValid` options; `lastSend` for assertions.

### Privacy and safety

- **Do not include sensitive financial amounts in SMS by default.** Prefer concise messages with a link or app prompt. If a template must include an amount (e.g. receipt confirmation when tenant allows), use a dedicated template key and ensure tenant has cost controls (e.g. `smsReceiptConfirmationEnabled`) enabled.

### Example SMS templates (5 MVP use cases)

Use these as `templateKey` and `bodyTemplate` (channel = SMS). Keep body under 160 chars where possible.

| templateKey | Use case | Example bodyTemplate |
|-------------|----------|----------------------|
| `meeting_reminder` | Meeting reminder | `{{groupName}}: Meeting {{meetingDate}}. Details: {{appLink}}` |
| `contribution_due_reminder` | Contribution due reminder | `{{groupName}}: Contribution due. Check the app: {{appLink}}` |
| `overdue_repayment_reminder` | Overdue repayment reminder | `{{groupName}}: Repayment overdue. Please pay or contact the group: {{appLink}}` |
| `approval_required` | Approval required (chair/treasurer) | `{{groupName}}: Action needed – {{actionSummary}}. Open app: {{appLink}}` |
| `receipt_confirmation` | Receipt confirmation (tenant-configurable) | `{{groupName}}: We received your {{recordType}}. Thank you. {{appLink}}` |
| `approval_decision` | Approval decision to member (in-app + optional SMS) | `{{groupName}}: Your loan application was {{decision}}. {{appLink}}` |

Variables: `groupName`, `appLink`, `meetingDate`, `actionSummary`, `recordType`, `decision`. Avoid putting exact monetary amounts in the template unless the tenant explicitly enables receipt SMS and the template is approved for that.

## Notification triggers (workflow integration)

Domain events trigger notifications without blocking writes:

- **Contribution receipt**: After `ContributionService.record()`, `NotificationTriggerService.contributionReceipt()` is invoked fire-and-forget. Queues IN_APP (always) and SMS (tenant preference). Failure is logged; transaction is not rolled back.
- **Loan approval required**: After `LoanApplicationService.submit()`, `approvalRequired()` notifies approvers (chair/treasurer) via IN_APP + SMS.
- **Approval decision**: After `LoanApprovalService.approve()` or `reject()`, `approvalDecision()` notifies the member (borrower) via IN_APP + optional SMS.
- **Overdue repayment reminder**: Use `NotificationTriggerService.enqueueOverdueReminders({ tenantGroupId?, loanId? })` from a scheduler or call **POST /notifications/triggers/overdue-reminder** (manual). Requires `tenantGroupId` in body for RBAC.
- **Meeting reminder**: Use `enqueueMeetingReminders({ meetingId?, tenantGroupId?, withinHours? })` from a scheduler or **POST /notifications/triggers/meeting-reminder**. Manual trigger requires `tenantGroupId` for RBAC when not passing `meetingId`.

Manual trigger endpoints require `NOTIFICATION_RESEND` and emit audit `NOTIFICATION_TRIGGER_MANUAL` when `actorUserId` is provided.

## Flow

1. **Queue**: Create Notification (QUEUED). Optionally `sendImmediately` to send once. Pass `auditAction` and `actorUserId` for privileged/admin audit.
2. **Send**: Resolve template (group-specific then global), render, check tenant + user preference (unless `mandatory`), dispatch, set SENT/FAILED, increment retryCount on failure.
3. **Retry**: For FAILED notifications with retryCount < max, reset to QUEUED and call send again. Emit audit `NOTIFICATION_RETRY_REQUESTED` when actorUserId provided.
4. **markDelivered**: Update SENT → DELIVERED with optional providerMessageId.

## Tenant scoping and preferences

- All notifications are tenant-scoped (tenantGroupId). **NotificationPreferenceService** for SMS: checks tenant `smsNotificationsEnabled` (from current rule snapshot), `smsReceiptConfirmationEnabled` for receipt-style template keys, and member `smsOptOut` for non-mandatory SMS. Other channels (IN_APP, EMAIL) allowed for MVP.

## Audit

- Emit audit for privileged notification triggers when `queue(..., { auditAction, actorUserId })` is used.
- Emit audit for admin resend/retry when `retry(id, actorUserId)` is called.

## Testing

- Template: render success (variable substitution), missing keys → empty, null payload.
- Notification: queue returns QUEUED; send transitions to SENT when template exists and dispatch succeeds; send sets FAILED when template missing or dispatch fails (with retryCount); retry resets FAILED to QUEUED and re-sends, audit logged.
