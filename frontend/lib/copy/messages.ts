/**
 * VillageCircle360 UX copy – UK English, audit-friendly, MVP-safe.
 *
 * MVP: software-only recordkeeping. Wording must not imply that the app
 * holds funds, moves money, or performs regulated lending. Use "recorded",
 * "tracked", "record" for external transactions; avoid "pay", "transfer"
 * where that would imply execution.
 *
 * @see lib/copy/keys.ts
 * @see docs/DESIGN_SYSTEM.md
 */

import type { CopyKey } from './keys';

export type CopyMessages = Record<CopyKey, string>;

export const messages: CopyMessages = {
  // Common
  common_button_back: 'Back',
  common_button_cancel: 'Cancel',
  common_button_confirm: 'Confirm',
  common_button_retry: 'Try again',
  common_button_submit: 'Submit',
  common_error_generic: 'Something went wrong',
  common_loading: 'Loading…',
  common_empty_title: 'No items',
  common_permissionDenied: "You don't have permission to perform this action.",
  common_exampleRecordSummary: '{amount} recorded for {groupName}.',

  // VC Save – dashboard card and perimeter
  save_dashboard_card_title: 'VC Save',
  save_dashboard_card_description: 'Record savings and track external payments and remittances. Receipts and logs only; no in-app money movement.',
  save_dashboard_card_description_short: 'Savings & statements. Records and receipts only.',
  save_mvp_perimeter: 'Amounts shown are recorded in the system. This app does not hold or move funds.',

  // VC Save – statement bucket labels
  save_bucket_savings: 'Savings',
  save_bucket_socialFund: 'Social fund',
  save_bucket_loanPrincipal: 'Loan principal',
  save_bucket_interest: 'Interest',
  save_bucket_penalties: 'Penalties',
  save_contribution_recordType: 'Contribution',

  // VC Save – transaction mode
  save_transactionMode_label: 'Transaction mode',
  save_transactionMode_cash: 'Cash',
  save_transactionMode_cashShort: 'Cash',
  save_transactionMode_bank: 'Bank transfer',
  save_transactionMode_bankShort: 'Bank',
  save_transactionMode_hint: 'How the payment was made outside the app. This record does not execute any transfer.',

  // VC Save – external reference
  save_externalRef_placeholder: 'e.g. Bank ref: 123456 or Cash receipt #001',
  save_externalRef_hintBank: 'Bank transfer: use payment reference from your bank.',
  save_externalRef_hintCash: 'Cash: use receipt number or brief note.',

  // VC Save – evidence
  save_evidence_label: 'Evidence',
  save_evidence_uploadHelper: 'Upload a photo or document as proof of payment. Optional; you can add evidence to the record later.',
  save_evidence_lockedExplanation: 'Evidence is linked to this record and cannot be changed here. To correct evidence, reverse this record and create a new one with the right details.',
  save_evidence_optionalDetail: 'Evidence image: optional (attach via detail later)',

  // VC Save – batch review and totals
  save_batch_summaryTitle: 'Batch summary',
  save_batch_savingsTotal: 'Savings total',
  save_batch_socialFundTotal: 'Social fund total',
  save_batch_totalCollected: 'Total collected',
  save_batch_cashCount: 'Cash',
  save_batch_bankCount: 'Bank transfer',
  save_batch_willBeRecorded: '{count} contribution(s) will be recorded.',
  save_batch_submitting: 'Submitting…',
  save_contribution_success: 'Contributions recorded successfully.',
  save_reconciliation_heading: 'Recorded totals',
  save_reconciliation_disclaimer: 'For reconciliation only. These are records of amounts received outside the app.',

  // VC Hub – dashboard, group, governance, meetings, approvals, share-out
  hub_dashboard_card_title: 'VC Hub',
  hub_dashboard_card_description: 'Groups, meetings, governance and share-out workflows. Software-only recordkeeping; the app does not execute financial transactions.',
  hub_onboarding_description: 'VC Hub supports your group’s governance, meetings, voting and share-out. All activity is recorded in the app; the app does not execute financial transactions.',
  hub_group_creation_title: 'Create group',
  hub_group_creation_description: 'Set up your group and invite members. You can assign roles and group rules later.',
  hub_roles_heading: 'Roles and responsibilities',
  hub_roles_helperText: 'Roles control who can record contributions, approve loans, or change group rules. Assign according to your group’s governance.',
  hub_meeting_setup_heading: 'Meeting setup',
  hub_meeting_selectOrCreate: 'Select or create meeting',
  hub_meeting_newMeeting: 'New meeting',
  hub_meeting_dateLabel: 'Date',
  hub_meeting_nameLabel: 'Name (optional)',
  hub_meeting_namePlaceholder: 'e.g. March 2025',
  hub_meeting_createAndEnter: 'Create and enter',
  hub_meeting_creating: 'Creating…',
  hub_meeting_noMeetingsTitle: 'No meetings yet',
  hub_meeting_noMeetingsDescription: 'Create a meeting to start recording contributions.',
  hub_meeting_attendance_heading: 'Attendance',
  hub_meeting_reopen_warningTitle: 'Reopen meeting',
  hub_meeting_reopen_warningBody: 'Reopening allows further changes to this meeting’s records. Existing entries remain; new or edited entries will be audited. Only reopen if your group’s process allows it.',
  hub_approval_queue_heading: 'Approvals',
  hub_approval_approveLoan: 'Approve loan',
  hub_approval_rejectLoan: 'Reject application',
  hub_approval_confirmApprove: 'Confirm approval',
  hub_approval_confirmReject: 'Confirm rejection',
  hub_approval_applicationApproved: 'Application approved. Loan record created.',
  hub_approval_applicationRejected: 'Application rejected.',
  hub_approval_applicantNotified: 'The applicant has been notified.',
  hub_approval_viewOnlyHeading: 'View only',
  hub_approval_viewOnlyDescription: 'You are viewing this application. You do not have permission to approve or reject it. Contact your group admin if you need decision-making access.',
  hub_approval_makingDecisionDescription: 'You are about to make a decision that will be recorded. This cannot be undone via this screen.',
  hub_rules_heading: 'Group rules',
  hub_rules_helperText: 'Group rules define how your group runs (e.g. savings targets, loan limits). Changes can be versioned and take effect from a future date.',
  hub_rule_change_warningTitle: 'Change group rules',
  hub_rule_change_warningBody: 'Changing rules creates a new version. The new rules will apply from the effective date you set. Existing records are not changed. Make sure your group has agreed to this change.',
  hub_rule_versioned_note: 'Rules are versioned. Past versions remain visible for audit.',
  hub_shareout_draft_label: 'Draft',
  hub_shareout_draft_description: 'This share-out is a draft. Amounts and members can change until it is finalised.',
  hub_shareout_final_label: 'Finalised',
  hub_shareout_final_description: 'This share-out has been finalised. It is recorded for audit and cannot be edited.',
  hub_audit_transparency_heading: 'Transparency and audit',
  hub_audit_transparency_description: 'All decisions and changes made here are recorded. Group auditors can view the audit trail.',
  hub_permission_denied_title: 'Access restricted',
  hub_permission_denied_message: 'You do not have permission to view or use this area.',
  hub_permission_denied_contactAdmin: 'Contact your group admin or chair if you need access.',
  hub_meetings_page_title: 'Meetings',
  hub_meetings_page_emptyTitle: 'No meetings',
  hub_meetings_page_emptyDescription: 'Create and manage meetings for contribution recording.',
  hub_audit_log_title: 'Audit',
  hub_audit_log_placeholderDescription: 'View audit history (placeholder).',
  hub_backToContributions: 'Back to Contributions',
  hub_backToLoans: 'Back to Loans',
  hub_backToDashboard: 'Back to Dashboard',
  hub_errorLoadMeetings: 'Could not load meetings.',
  hub_errorLoadApplication: 'Could not load application.',

  // Member – VC Save / VC Hub
  member_dashboard_title: 'Dashboard',
  member_dashboard_subtitle: 'Your circle at a glance',
  member_dashboard_savingsTotal: 'Savings total',
  member_dashboard_socialFundTotal: 'Social fund total',
  member_dashboard_activeLoanBalance: 'Active loan balance',
  member_dashboard_errorLoad: 'Could not load your summary. Please try again.',
  member_dashboard_recentActivity: 'Recent activity',
  member_dashboard_noRecentActivity: 'No recent activity',
  member_dashboard_noRecentActivityDescription: 'Your contributions and loan activity will appear here.',
  member_dashboard_viewStatements: 'View statements',
  member_dashboard_upcoming: 'Upcoming',
  member_dashboard_noUpcomingMeetings: 'No upcoming meetings',
  member_dashboard_noUpcomingMeetingsDescription: 'When a meeting is scheduled it will appear here.',
  member_statements_title: 'My statements',
  member_statements_errorLoad: 'Could not load statements.',
  member_statements_entriesByBucket: 'Entries by bucket',
  member_statements_noEntries: 'No entries',
  member_statements_emptyDescription: 'Filter by date or record contributions to see activity.',
  member_statements_dateFrom: 'From',
  member_statements_dateTo: 'To',
  member_statements_exportUnavailable: 'Export',
  member_statements_exportUnavailableHint: 'Export is not available yet. Use reports in the operations area when available.',
  member_contribution_recorded: 'Contribution',
  member_mvp_disclaimer: 'Amounts shown are recorded in the system. This app does not hold or move funds.',
  member_backToDashboard: 'Back to Dashboard',

  // Operations – meeting entry (VC Save)
  ops_meeting_entry_title: 'Meeting entry',
  ops_meeting_entry_backToMeetings: 'Back to Meetings',
  ops_meeting_entry_helpText: 'Enter contributions per member. Use "Mark absent / zero" to skip. Total = Savings + Social fund.',
  ops_meeting_entry_savingsLabel: 'Savings (£)',
  ops_meeting_entry_socialFundLabel: 'Social fund (£)',
  ops_meeting_entry_totalLabel: 'Total',
  ops_meeting_entry_markAbsent: 'Mark absent / zero',
  ops_meeting_entry_includeMember: 'Include member',
  ops_meeting_entry_reviewSubmit: 'Review and submit',
  ops_meeting_entry_submitBatch: 'Submit batch',
  ops_meeting_entry_submitting: 'Submitting…',
  ops_meeting_entry_backToEntry: 'Back',
  ops_meeting_entry_noMembersTitle: 'No members',
  ops_meeting_entry_noMembersDescription: 'Add members to the group first.',
  ops_meeting_entry_errorLoadMembers: 'Could not load members.',
  ops_meeting_detail_title: 'Meeting',
  ops_meeting_detail_addMoreEntries: 'Add more entries',
  ops_meeting_detail_errorLoad: 'Could not load meeting summary.',
  ops_meeting_detail_totalsHeading: 'Totals',
  ops_contribution_reverse: 'Reverse',
  ops_contribution_reversalReasonRequired: 'Reason (required)',
  ops_contribution_reversalDialogTitle: 'Reverse contribution',
  ops_loan_approve: 'Approve',
  ops_loan_repay_record: 'Record repayment',
  ops_loan_repay_duplicateMessage: 'This repayment was already recorded with the same idempotency key. No duplicate has been created.',
  ops_mvp_recorded_not_executed: 'This records a contribution received outside the app. The app does not process or hold funds.',

  // VC Grow – loans (MVP = recordkeeping only; platform records and tracks for the group)
  grow_dashboard_card_title: 'VC Grow',
  grow_dashboard_card_description: 'Loan records, approvals and repayment tracking. Credit history records only. No regulated lending by the platform.',
  grow_mvp_perimeter: 'The platform records and tracks loan activity for your group. It does not provide or execute lending.',
  grow_mvp_loan_disclaimer: 'Loans are managed by your group. This app records applications and repayments; it does not provide or execute lending.',
  grow_loan_request_title: 'Request a loan',
  grow_loan_request_backToLoans: 'Back to My Loans',
  grow_loan_request_groupPolicyHeading: 'Group policy',
  grow_interest_enabled: 'Yes',
  grow_interest_disabled: 'No',
  grow_interest_mayApply: 'Interest may apply ({rate}% rate). Terms set at approval.',
  grow_interest_doesNotApply: 'Interest does not apply for loans in this group.',
  grow_loan_request_amountLabel: 'Requested amount (£)',
  grow_loan_request_termLabel: 'Requested term (number of periods)',
  grow_loan_request_termPlaceholder: 'e.g. 12',
  grow_loan_request_termErrorRequired: 'Term is required',
  grow_loan_request_termErrorInvalid: 'Enter a whole number of periods (at least 1)',
  grow_loan_request_purposeLabel: 'Purpose or note (optional)',
  grow_loan_request_purposePlaceholder: 'e.g. Home repair',
  grow_loan_request_continue: 'Continue',
  grow_loan_request_confirmHeading: 'Confirm your application',
  grow_loan_request_submit: 'Submit application',
  grow_loan_request_submitting: 'Submitting…',
  grow_ruleSnapshot_heading: 'Current group rules (if you approve)',
  grow_ruleSnapshot_interestLabel: 'Interest',
  grow_ruleSnapshot_termLabel: 'Term',
  grow_repay_title: 'Record repayment',
  grow_repay_backToLoan: 'Back to Loan',
  grow_repay_loanSummaryHeading: 'Loan summary',
  grow_repay_outstandingLabel: 'Outstanding',
  grow_repay_allocationOrderExplainer: 'Repayments are applied in this order: penalties first, then interest, then principal.',
  grow_repay_duplicateMessage: 'This repayment was already recorded with the same idempotency key. No duplicate has been created.',
  grow_repay_success: 'Repayment recorded successfully.',
  grow_repay_allocatedPrincipal: 'principal',
  grow_repay_allocatedInterest: 'interest',
  grow_repay_allocatedPenalty: 'penalty',
  grow_repay_evidenceLinkedNote: 'Evidence is linked to this record and cannot be changed.',
  grow_repay_amountLabel: 'Amount (£)',
  grow_repay_transactionModeRequired: 'Transaction mode is required.',
  grow_repay_recording: 'Recording…',
  grow_repay_recordButton: 'Record repayment',
  grow_repay_recordButtonShort: 'Record repay',
  grow_repay_loanNotActive: 'This loan is not active. Repayments can only be recorded for active loans.',
  grow_repay_noOutstanding: 'This loan has no outstanding amount.',
  grow_repay_errorLoadLoan: 'Could not load loan.',
  grow_loan_detail_title: 'Loan',
  grow_loan_detail_backToActive: 'Back to Active Loans',
  grow_loan_detail_loanStateHeading: 'Loan state',
  grow_loan_detail_principalLabel: 'Principal',
  grow_loan_detail_totalRepaidLabel: 'Total repaid',
  grow_loan_detail_outstandingLabel: 'Outstanding',
  grow_loan_detail_ruleSnapshotHeading: 'Rule snapshot',
  grow_loan_detail_interestEnabled: 'Enabled',
  grow_loan_detail_interestDisabled: 'Disabled',
  grow_loan_detail_scheduleHeading: 'Schedule',
  grow_loan_detail_scheduleEmptyDescription: 'Schedule will appear after disbursement.',
  grow_loan_detail_scheduleConfidenceNote: 'Schedule and repayment history are recorded for audit. Subject to group rules and any reschedule or waiver.',
  grow_loan_detail_exceptionHistoryHeading: 'Exception history',
  grow_loan_detail_repaymentHistoryHeading: 'Repayment history',
  grow_loan_detail_noRepaymentsYet: 'No repayments yet',
  grow_loan_detail_noRepaymentsDescription: 'Record a repayment to update the schedule.',
  grow_loan_detail_actionsHeading: 'Actions',
  grow_loan_detail_recordWaiver: 'Record waiver',
  grow_loan_detail_reschedule: 'Reschedule',
  grow_loan_detail_writeOff: 'Write off',
  grow_loan_detail_recordRepaymentLink: 'Record repayment',
  grow_loan_detail_waiverRecorded: 'Waiver recorded.',
  grow_loan_detail_rescheduleRecorded: 'Reschedule recorded. Prior schedule superseded.',
  grow_loan_detail_writeOffRecorded: 'Write-off recorded.',
  grow_loan_detail_waiverDialogTitle: 'Record waiver',
  grow_loan_detail_waiverDialogBody: 'Reason is required. This will create an audit record.',
  grow_loan_detail_rescheduleDialogTitle: 'Reschedule loan',
  grow_loan_detail_rescheduleDialogBody: 'Prior schedule will be superseded. Reason and new terms required.',
  grow_loan_detail_writeOffDialogTitle: 'Write off loan',
  grow_loan_detail_writeOffDialogBody: 'Reason is required. This action may be restricted by the backend.',
  grow_loan_detail_errorLoadLoan: 'Could not load loan.',
  grow_overdue_reminderNote: 'Overdue amounts may attract penalties under group rules. Record repayments to update the schedule.',

  // Legal and compliance (placeholders – replace with counsel-approved text)
  legal_termsSummary_short: 'By using this service you agree to our terms of use. [Replace with counsel-approved summary.]',
  legal_termsSummary_full: 'Terms of use summary placeholder. [Replace with counsel-approved full terms summary or link to terms.]',
  legal_privacySummary_short: 'We process your data as set out in our privacy notice. [Replace with counsel-approved summary.]',
  legal_privacySummary_full: 'Privacy notice summary placeholder. [Replace with counsel-approved full privacy summary or link to privacy policy.]',
  legal_nonBankDisclaimer_short: 'This service is not a bank or e-money institution. It records and tracks activity; it does not hold or move funds.',
  legal_nonBankDisclaimer_full: 'VillageCircle360 is not a bank, building society, or e-money institution. The platform provides software for recording and tracking savings, contributions and loan activity. It does not hold funds, execute payments, or provide regulated lending. [Replace with counsel-approved full disclaimer if required.]',
  legal_recordkeepingNotice_save_short: 'VC Save records and tracks external transactions and contributions. The app does not hold or move funds.',
  legal_recordkeepingNotice_save_full: 'VC Save is for recordkeeping only. It records savings and contributions and tracks external payments and remittances. The platform does not hold funds or execute payments. [Replace with counsel-approved wording if required.]',
  legal_recordkeepingNotice_hub_short: 'VC Hub supports governance and recordkeeping workflows. The app does not execute financial transactions.',
  legal_recordkeepingNotice_hub_full: 'VC Hub supports your group’s governance, meetings and share-out workflows. Activity is recorded in the app; the app does not execute financial transactions. [Replace with counsel-approved wording if required.]',
  legal_recordkeepingNotice_grow_short: 'VC Grow records loan workflows and approvals for groups. The platform does not provide or execute lending.',
  legal_recordkeepingNotice_grow_full: 'VC Grow records loan applications, approvals and repayments for your group. The platform records and tracks loan activity; it does not provide or execute lending. [Replace with counsel-approved wording if required.]',
  legal_evidenceUploadNotice_short: 'Uploaded evidence is stored and may be used for audit and support. Do not upload sensitive data beyond what is needed.',
  legal_evidenceUploadNotice_full: 'Evidence you upload (e.g. receipts, photos) is stored and linked to records. It may be used for group audit and, where applicable, support purposes. Only upload what is necessary for the record. [Replace with counsel-approved privacy/retention wording if required.]',
  legal_supportAccessNotice_short: 'Support access is logged for audit. Use only for the stated support reason.',
  legal_supportAccessNotice_full: 'Access to tenant data for support purposes is reason-coded and logged. Your case ID and reason code are recorded. Use this access only for the stated support reason. [Replace with counsel-approved accountability wording if required.]',
  legal_onboarding_disclaimer_short: 'By continuing you accept our terms and privacy notice. The service records and tracks activity; it does not hold funds or execute payments.',
  legal_onboarding_disclaimer_full: 'By signing up or accepting an invite you agree to our terms of use and privacy notice. This service is for recordkeeping; it does not hold funds, execute payments, or provide regulated lending. [Replace with counsel-approved onboarding text if required.]',
  legal_permissionDenied_inline: "You don't have permission to perform this action.",
  legal_permissionDenied_contactAdmin: 'If you believe you should have access, contact your group administrator or support.',
  legal_supportReason_prompt: 'Enter support case or incident ID and reason code to access tenant trace and evidence views. This access is logged for audit.',
  legal_supportReason_warning: 'Use this access only for the stated support reason. Your case ID and reason are recorded.',
  legal_supportReason_requiredFields: 'Case/incident ID, reason code, tenant group ID, and your user ID are required.',
  legal_supportReason_caseIdLabel: 'Case / incident ID',
  legal_supportReason_tenantIdLabel: 'Tenant group ID',
  legal_supportReason_actorIdLabel: 'Your user ID (for audit)',
  legal_supportEvidence_auditedBanner: 'This view is audited. Your support case ID and reason code have been logged. Do not use for purposes other than the stated support reason.',
  legal_supportEvidence_accessDenied: 'Access denied. You may not have permission to view this evidence in a support context.',
  legal_supportEvidence_gateTitle: 'Support access required to view evidence',

  // Notifications
  notifications_preferences_title: 'Notification preferences',
  notifications_sms_nonCritical: 'Receive non-critical SMS reminders',
  // notifications.common.*
  notifications_common_emptyTitle: 'No notifications',
  notifications_common_emptyDescription: 'When you have notifications they will appear here.',
  notifications_common_errorLoad: 'Could not load notifications.',
  notifications_common_ctaView: 'View',
  notifications_common_statusSending: 'Sending…',
  notifications_common_statusFailed: 'Failed to send',
  notifications_common_failureGeneric: 'Something went wrong. Please try again.',
  // notifications.meeting.* – template: {groupName}, {meetingName}, {meetingDate}
  notifications_meeting_reminder_title_inApp: 'Meeting reminder: {meetingName}',
  notifications_meeting_reminder_title_sms: 'Meeting: {groupName}',
  notifications_meeting_reminder_body_inApp: '{groupName} has a meeting scheduled. {meetingName} – {meetingDate}.',
  notifications_meeting_reminder_body_sms: 'Meeting reminder for {groupName}. Open app for details.',
  notifications_meeting_reminder_cta: 'View meeting',
  // notifications.contribution.* – template: {groupName}, {amount}, {dueDate}; SMS avoids amount where possible
  notifications_contribution_dueReminder_title_inApp: 'Contribution due – {groupName}',
  notifications_contribution_dueReminder_title_sms: 'Contribution due',
  notifications_contribution_dueReminder_body_inApp: 'A contribution is due for {groupName}. Due: {dueDate}.',
  notifications_contribution_dueReminder_body_sms: 'Contribution due for your group. Open app for details.',
  notifications_contribution_dueReminder_cta: 'View contributions',
  notifications_contribution_receipt_title_inApp: 'Contribution recorded – {groupName}',
  notifications_contribution_receipt_title_sms: 'Contribution recorded',
  notifications_contribution_receipt_body_inApp: 'Your contribution of {amount} has been recorded for {groupName}.',
  notifications_contribution_receipt_body_sms: 'Your contribution has been recorded. Open app for details.',
  notifications_contribution_receipt_cta: 'View statement',
  // notifications.loan.* – template: {groupName}; SMS no amount/outstanding
  notifications_loan_overdueReminder_title_inApp: 'Overdue repayment – {groupName}',
  notifications_loan_overdueReminder_title_sms: 'Overdue repayment',
  notifications_loan_overdueReminder_body_inApp: 'You have an overdue repayment for a loan in {groupName}. Record a repayment or check your schedule.',
  notifications_loan_overdueReminder_body_sms: 'Overdue repayment for your group. Open app to record or view schedule.',
  notifications_loan_overdueReminder_cta: 'View loan',
  // notifications.approval.* – template: {groupName}, {applicantName}, {outcome}
  notifications_approval_required_title_inApp: 'Approval required – {groupName}',
  notifications_approval_required_title_sms: 'Approval required',
  notifications_approval_required_body_inApp: 'A loan application in {groupName} is waiting for your decision.',
  notifications_approval_required_body_sms: 'A loan application needs your decision. Open app to approve or reject.',
  notifications_approval_required_cta: 'View application',
  notifications_approval_decision_approved_title_inApp: 'Application approved – {groupName}',
  notifications_approval_decision_approved_title_sms: 'Application approved',
  notifications_approval_decision_rejected_title_inApp: 'Application update – {groupName}',
  notifications_approval_decision_rejected_title_sms: 'Application update',
  notifications_approval_decision_body_approved_inApp: 'Your loan application to {groupName} has been approved.',
  notifications_approval_decision_body_rejected_inApp: 'Your loan application to {groupName} was not approved. Contact your group for details.',
  notifications_approval_decision_body_sms: 'Your loan application has been decided. Open app for details.',
  notifications_approval_decision_cta: 'View loan',
  // notifications.system.* – admin-facing; template: {phoneLast4} or generic
  notifications_system_smsDeliveryFailed_title: 'SMS delivery failed',
  notifications_system_smsDeliveryFailed_body: 'An SMS could not be delivered. Check the failed delivery list for details and retry options.',
  notifications_system_smsDeliveryFailed_cta: 'View failed deliveries',
  notifications_system_smsDeliveryFailed_statusFailed: 'Failed',
  notifications_system_smsDeliveryFailed_statusRetrying: 'Retrying',
  notifications_system_smsDeliveryFailed_statusUndeliverable: 'Undeliverable',
  // SMS template pack – short (single-segment target) and standard variants
  notifications_sms_meeting_reminder_short: '{groupName}: Meeting {meetingDate}. {appLink}',
  notifications_sms_meeting_reminder_standard: 'VillageCircle360 – {groupName}: Meeting reminder for {meetingDate}. {appLink}',
  notifications_sms_contribution_due_short: 'Contribution due for {groupName}. {appLink}',
  notifications_sms_contribution_due_standard: 'VillageCircle360 – Contribution due for {groupName}. Open app to view details. {appLink}',
  notifications_sms_overdue_repayment_short: 'Overdue repayment – {groupName}. {appLink}',
  notifications_sms_overdue_repayment_standard: 'VillageCircle360 – Overdue repayment for your loan in {groupName}. Open app to record or view schedule. {appLink}',
  notifications_sms_approval_required_short: 'Approval needed – {groupName}. {appLink}',
  notifications_sms_approval_required_standard: 'VillageCircle360 – A loan application in {groupName} needs your decision. Open app to approve or reject. {appLink}',
  notifications_sms_receipt_confirmation_short: 'Contribution recorded for {groupName}. {appLink}',
  notifications_sms_receipt_confirmation_standard: 'VillageCircle360 – Your contribution has been recorded for {groupName}. Open app for your statement. {appLink}',
  notifications_sms_receipt_confirmation_withAmount_standard: 'VillageCircle360 – Your contribution of {amount} has been recorded for {groupName}. Open app for your statement. {appLink}',
  notifications_sms_linkOpenApp: 'Open app',
  notifications_sms_linkViewDetails: 'View in app',
  notifications_sms_consentReminder: 'You receive these reminders based on your preferences. Manage in app.',
  // Preferences screen
  notifications_preferences_emptyTitle: 'No preferences set',
  notifications_preferences_emptyDescription: 'Configure how you receive notifications (in-app, email, SMS where enabled).',
  notifications_preferences_errorLoad: 'Could not load notification preferences.',

  // Admin / Support
  admin_support_gate_title: 'Support access required',
  admin_support_gate_reasonCode: 'Reason code',
  admin_support_gate_startAccess: 'Start support access',
  admin_support_home_title: 'Support home',
  admin_support_home_subtitle: 'Admin and support tools (reason-coded access)',
  admin_support_home_description: 'Use the navigation to access audit log, SMS failures, and entity traces. All actions require a reason code and case ID.',
  admin_support_home_inactiveNotice: 'Enter support access (case ID and reason code) on the Audit log, SMS failures, or Entity traces page to view tenant data.',
  admin_trace_financialCorrectionWarning: 'Financial corrections must use reversal or adjustment workflows. This screen is read-only; no edit actions.',
  admin_evidence_auditedView: 'This view is audited.',

  // Immutable record / history (reversals, audit)
  immutable_originalRecordPreserved: 'The original record is preserved and remains visible.',
  immutable_reversalCreated: 'A reversal record has been created.',
  immutable_historyVisible: 'History is visible for audit.',
  immutable_reversalExplanation: 'Reversing creates a reversing ledger entry and an audit record. The original record remains visible but marked reversed. History is preserved for audit.',
  immutable_recordReversedMessage: 'This record has been reversed. History is preserved for audit.',

  // Later – VC Pay, VC Learn (placeholders; do not imply current availability or regulated capabilities)
  pay_comingLater: 'VC Pay (merchant QR, POS, collections) – coming in a later release.',
  pay_comingSoon: 'Coming in a later release',
  pay_cardTitle: 'VC Pay',
  pay_cardDescription: 'Merchant QR, POS, collections and invoices. Not available in this release.',
  pay_roadmapDescription: 'VC Pay will support merchant QR, point-of-sale, collections and invoices in a future release. Not available in MVP.',
  learn_comingLater: 'VC Learn (short courses) – coming in a later release.',
  learn_comingSoon: 'Coming in a later release',
  learn_cardTitle: 'VC Learn',
  learn_cardDescription: 'Short courses: money, business, agri, digital safety. Not available in this release.',
  learn_roadmapDescription: 'VC Learn will offer short courses on money, business, agri and digital safety in a future release. Not available in MVP.',
};

/**
 * Get copy by key. Use for consistent, replaceable copy across the app.
 * In non-production builds, missing keys return a visible placeholder so QA can spot them.
 */
export function getCopy(key: CopyKey): string {
  const value = messages[key];
  if (value !== undefined && (typeof value !== 'string' || value.length > 0)) return value;
  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
    return `[COPY:${key}]`;
  }
  return key;
}

/**
 * Standard placeholder names for templated copy. Use in message strings as {amount}, {groupName}, etc.
 * @see docs/UX_COPY_STYLE_GUIDE.md § Variable conventions
 */
export type CopyTemplateVars = {
  amount?: string;
  groupName?: string;
  dueDate?: string;
  transactionMode?: string;
  actorName?: string;
  recordType?: string;
  reason?: string;
  count?: string | number;
  /** Notification templates */
  meetingName?: string;
  meetingDate?: string;
  applicantName?: string;
  outcome?: string;
  /** SMS templates: link text or URL injected by backend */
  appLink?: string;
  /** Loan reference (e.g. short id); use only when safe and tenant-configured */
  loanRef?: string;
  [key: string]: string | number | undefined;
};

/**
 * Get copy by key and substitute placeholders. Placeholders use {name} in the message string.
 * Example: getCopyTemplate(KEY, { amount: '£20.00', groupName: 'Tuesday Circle' })
 */
export function getCopyTemplate(key: CopyKey, vars: CopyTemplateVars): string {
  let text = getCopy(key);
  for (const [k, v] of Object.entries(vars)) {
    if (v !== undefined) text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
  }
  return text;
}
