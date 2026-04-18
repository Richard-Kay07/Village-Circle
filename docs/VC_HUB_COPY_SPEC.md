# VC Hub (MVP) – UX copy spec

Core UX copy for VC Hub in VillageCircle360 UK MVP/V1. Scope: groups, governance, meetings, voting/resolutions (as implemented), share-out workflow support, roles and approvals.

**References:** `frontend/lib/copy/` (keys, messages), `docs/UX_COPY_STYLE_GUIDE.md`.

---

## 1. VC Hub scope in MVP

- **Groups** – Creation, members, roles.
- **Governance** – Group rules, versioning, effective dates.
- **Meetings** – Setup, attendance, contribution recording.
- **Voting / resolutions** – As implemented (e.g. resolution labels, outcomes).
- **Share-out workflow** – Draft vs final; audit trail.
- **Roles and approvals** – Chair, treasurer, auditor; approval queue and decision confirmations.

Copy explains governance in plain language without sounding legalistic. It clearly separates **viewing records** from **making an approval decision**.

---

## 2. Copy dictionary and usage

### 2.1 Dashboard card and onboarding

| Key | Content | Usage |
|-----|---------|--------|
| hub_dashboard_card_title | VC Hub | Module card title |
| hub_dashboard_card_description | Groups, meetings, governance and share-out workflows. Software-only recordkeeping; the app does not execute financial transactions. | Card body |
| hub_onboarding_description | VC Hub supports your group’s governance, meetings, voting and share-out. All activity is recorded in the app; the app does not execute financial transactions. | Onboarding / first-run |

### 2.2 Group setup

| Key | Content | Usage |
|-----|---------|--------|
| hub_group_creation_title | Create group | Page or section title |
| hub_group_creation_description | Set up your group and invite members. You can assign roles and group rules later. | Helper below title |
| hub_roles_heading | Roles and responsibilities | Section heading |
| hub_roles_helperText | Roles control who can record contributions, approve loans, or change group rules. Assign according to your group’s governance. | Helper under roles list |

### 2.3 Meeting setup and attendance

| Key | Content | Usage |
|-----|---------|--------|
| hub_meeting_setup_heading | Meeting setup | Section heading |
| hub_meeting_selectOrCreate | Select or create meeting | Subheading |
| hub_meeting_newMeeting | New meeting | Section for create form |
| hub_meeting_dateLabel | Date | Form label |
| hub_meeting_nameLabel | Name (optional) | Form label |
| hub_meeting_namePlaceholder | e.g. March 2025 | Input placeholder |
| hub_meeting_createAndEnter | Create and enter | Button |
| hub_meeting_creating | Creating… | Button state |
| hub_meeting_noMeetingsTitle | No meetings yet | Empty state |
| hub_meeting_noMeetingsDescription | Create a meeting to start recording contributions. | Empty description |
| hub_meeting_attendance_heading | Attendance | Attendance section |
| hub_meeting_reopen_warningTitle | Reopen meeting | Warning heading |
| hub_meeting_reopen_warningBody | Reopening allows further changes to this meeting’s records. Existing entries remain; new or edited entries will be audited. Only reopen if your group’s process allows it. | Warning body – consequence clear |

### 2.4 Approvals queue and decisions

**Role-gated action labels (explicit verbs):**

| Key | Content | Usage |
|-----|---------|--------|
| hub_approval_queue_heading | Approvals | Queue/section heading |
| hub_approval_approveLoan | Approve loan | Button – verb first |
| hub_approval_rejectLoan | Reject application | Button |
| hub_approval_confirmApprove | Confirm approval | Confirmation step |
| hub_approval_confirmReject | Confirm rejection | Confirmation step |
| hub_approval_applicationApproved | Application approved. Loan record created. | Success message |
| hub_approval_applicationRejected | Application rejected. | Success message |
| hub_approval_applicantNotified | The applicant has been notified. | Post-decision note |

**Viewing vs making a decision:**

| Key | Content | Usage |
|-----|---------|--------|
| hub_approval_viewOnlyHeading | View only | Shown when user lacks approve/reject permission |
| hub_approval_viewOnlyDescription | You are viewing this application. You do not have permission to approve or reject it. Contact your group admin if you need decision-making access. | Clarifies view-only mode |
| hub_approval_makingDecisionDescription | You are about to make a decision that will be recorded. This cannot be undone via this screen. | Shown in confirmation dialog |

### 2.5 Group rules and versioning

| Key | Content | Usage |
|-----|---------|--------|
| hub_rules_heading | Group rules | Section heading |
| hub_rules_helperText | Group rules define how your group runs (e.g. savings targets, loan limits). Changes can be versioned and take effect from a future date. | Helper – non-legalistic |
| hub_rule_change_warningTitle | Change group rules | Warning dialog title |
| hub_rule_change_warningBody | Changing rules creates a new version. The new rules will apply from the effective date you set. Existing records are not changed. Make sure your group has agreed to this change. | Warning – consequence clear |
| hub_rule_versioned_note | Rules are versioned. Past versions remain visible for audit. | Note under rules |

### 2.6 Share-out (draft vs final)

| Key | Content | Usage |
|-----|---------|--------|
| hub_shareout_draft_label | Draft | Badge or label |
| hub_shareout_draft_description | This share-out is a draft. Amounts and members can change until it is finalised. | Helper |
| hub_shareout_final_label | Finalised | Badge or label |
| hub_shareout_final_description | This share-out has been finalised. It is recorded for audit and cannot be edited. | Helper |

### 2.7 Audit and transparency

| Key | Content | Usage |
|-----|---------|--------|
| hub_audit_transparency_heading | Transparency and audit | Section heading |
| hub_audit_transparency_description | All decisions and changes made here are recorded. Group auditors can view the audit trail. | Member-facing summary |
| hub_audit_log_title | Audit | Audit page title |
| hub_audit_log_placeholderDescription | View audit history (placeholder). | Placeholder for audit log |

### 2.8 Permission denied and navigation

| Key | Content | Usage |
|-----|---------|--------|
| hub_permission_denied_title | Access restricted | Permission-denied notice title |
| hub_permission_denied_message | You do not have permission to view or use this area. | Main message |
| hub_permission_denied_contactAdmin | Contact your group admin or chair if you need access. | Hint |
| hub_meetings_page_title | Meetings | Meetings list page title |
| hub_meetings_page_emptyTitle | No meetings | Empty state |
| hub_meetings_page_emptyDescription | Create and manage meetings for contribution recording. | Empty description |
| hub_backToContributions | Back to Contributions | Back link |
| hub_backToLoans | Back to Loans | Back link |
| hub_backToDashboard | Back to Dashboard | Back link |
| hub_errorLoadMeetings | Could not load meetings. | Error state |
| hub_errorLoadApplication | Could not load application. | Error state |

---

## 3. Examples by screen type

### Chair / treasurer (decision-making)

- **Loan application detail:** Use `hub_approval_approveLoan`, `hub_approval_rejectLoan`, `hub_approval_confirmApprove`, `hub_approval_confirmReject`. Before confirm: show `hub_approval_makingDecisionDescription`.
- **Meeting entry:** Use meeting setup keys and VC Save meeting entry copy; after submit use `save_contribution_success`.

### Auditor (read-only)

- **Audit page:** `hub_audit_log_title`, `hub_audit_log_placeholderDescription`. Optional: `hub_audit_transparency_heading`, `hub_audit_transparency_description`.
- **Loan application (no approve permission):** Show `hub_approval_viewOnlyHeading` and `hub_approval_viewOnlyDescription` instead of Approve/Reject buttons.

### Member-facing governance summary

- **Dashboard / info:** `hub_dashboard_card_description` or `hub_onboarding_description`.
- **Group rules:** `hub_rules_heading`, `hub_rules_helperText`, `hub_rule_versioned_note`.

### Permission denied

- Use `hub_permission_denied_title`, `hub_permission_denied_message`, `hub_permission_denied_contactAdmin` (or `common_permissionDenied` for a single short line). Pass `requiredPermission` for technical hint when appropriate.

---

## 4. Warnings – consequences clearly stated

- **Reopen meeting:** `hub_meeting_reopen_warningTitle` + `hub_meeting_reopen_warningBody` – states that reopening allows further changes, entries remain, new/edited entries audited, and to only reopen if group process allows.
- **Rule change:** `hub_rule_change_warningTitle` + `hub_rule_change_warningBody` – states new version, effective date, existing records unchanged, and that the group should have agreed.

---

## 5. Testing and checks

- **Key coverage:** `frontend/__tests__/lib/copy/vc-hub-copy-keys.test.ts` – all VC Hub keys exist and have non-empty messages.
- **Role-gated action labels:** Test asserts that approval/decision keys use explicit verbs (e.g. "Approve loan", "Reject application", "Confirm approval") and do not use vague labels like "Submit" or "OK" for decisions.
- **Warnings mention consequences:** Test asserts that `hub_meeting_reopen_warningBody` and `hub_rule_change_warningBody` contain consequence-related wording (e.g. "audited", "version", "effective date", "cannot be undone" or similar).
