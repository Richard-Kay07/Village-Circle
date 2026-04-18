/**
 * Validates VC Hub copy keys: existence, role-gated action labels use explicit verbs,
 * and warnings mention consequences clearly.
 *
 * @see docs/VC_HUB_COPY_SPEC.md
 */

import { COPY_KEYS, getCopy, messages } from '@/lib/copy';
import type { CopyKey } from '@/lib/copy';

/** VC Hub copy keys (hub_* and related approval/meeting keys used in Hub flows) */
const VC_HUB_KEYS: CopyKey[] = [
  COPY_KEYS.hub_dashboard_card_title,
  COPY_KEYS.hub_dashboard_card_description,
  COPY_KEYS.hub_onboarding_description,
  COPY_KEYS.hub_group_creation_title,
  COPY_KEYS.hub_group_creation_description,
  COPY_KEYS.hub_roles_heading,
  COPY_KEYS.hub_roles_helperText,
  COPY_KEYS.hub_meeting_setup_heading,
  COPY_KEYS.hub_meeting_selectOrCreate,
  COPY_KEYS.hub_meeting_newMeeting,
  COPY_KEYS.hub_meeting_dateLabel,
  COPY_KEYS.hub_meeting_nameLabel,
  COPY_KEYS.hub_meeting_namePlaceholder,
  COPY_KEYS.hub_meeting_createAndEnter,
  COPY_KEYS.hub_meeting_creating,
  COPY_KEYS.hub_meeting_noMeetingsTitle,
  COPY_KEYS.hub_meeting_noMeetingsDescription,
  COPY_KEYS.hub_meeting_attendance_heading,
  COPY_KEYS.hub_meeting_reopen_warningTitle,
  COPY_KEYS.hub_meeting_reopen_warningBody,
  COPY_KEYS.hub_approval_queue_heading,
  COPY_KEYS.hub_approval_approveLoan,
  COPY_KEYS.hub_approval_rejectLoan,
  COPY_KEYS.hub_approval_confirmApprove,
  COPY_KEYS.hub_approval_confirmReject,
  COPY_KEYS.hub_approval_applicationApproved,
  COPY_KEYS.hub_approval_applicationRejected,
  COPY_KEYS.hub_approval_applicantNotified,
  COPY_KEYS.hub_approval_viewOnlyHeading,
  COPY_KEYS.hub_approval_viewOnlyDescription,
  COPY_KEYS.hub_approval_makingDecisionDescription,
  COPY_KEYS.hub_rules_heading,
  COPY_KEYS.hub_rules_helperText,
  COPY_KEYS.hub_rule_change_warningTitle,
  COPY_KEYS.hub_rule_change_warningBody,
  COPY_KEYS.hub_rule_versioned_note,
  COPY_KEYS.hub_shareout_draft_label,
  COPY_KEYS.hub_shareout_draft_description,
  COPY_KEYS.hub_shareout_final_label,
  COPY_KEYS.hub_shareout_final_description,
  COPY_KEYS.hub_audit_transparency_heading,
  COPY_KEYS.hub_audit_transparency_description,
  COPY_KEYS.hub_permission_denied_title,
  COPY_KEYS.hub_permission_denied_message,
  COPY_KEYS.hub_permission_denied_contactAdmin,
  COPY_KEYS.hub_meetings_page_title,
  COPY_KEYS.hub_meetings_page_emptyTitle,
  COPY_KEYS.hub_meetings_page_emptyDescription,
  COPY_KEYS.hub_audit_log_title,
  COPY_KEYS.hub_audit_log_placeholderDescription,
  COPY_KEYS.hub_backToContributions,
  COPY_KEYS.hub_backToLoans,
  COPY_KEYS.hub_backToDashboard,
  COPY_KEYS.hub_errorLoadMeetings,
  COPY_KEYS.hub_errorLoadApplication,
];

/** Role-gated action keys that must start with an explicit verb (approve, reject, confirm, record, etc.) */
const ROLE_GATED_ACTION_KEYS: CopyKey[] = [
  COPY_KEYS.hub_approval_approveLoan,
  COPY_KEYS.hub_approval_rejectLoan,
  COPY_KEYS.hub_approval_confirmApprove,
  COPY_KEYS.hub_approval_confirmReject,
  COPY_KEYS.ops_loan_approve,
  COPY_KEYS.ops_loan_repay_record,
  COPY_KEYS.ops_contribution_reverse,
];

describe('VC Hub copy keys', () => {
  it('every VC Hub key exists and has a non-empty message', () => {
    const missing: string[] = [];
    const empty: string[] = [];
    for (const key of VC_HUB_KEYS) {
      const msg = messages[key];
      if (msg === undefined) missing.push(key);
      else if (typeof msg === 'string' && msg.length === 0) empty.push(key);
    }
    expect(missing).toEqual([]);
    expect(empty).toEqual([]);
  });

  it('role-gated action labels use explicit verbs (not vague "Submit" or "OK")', () => {
    const vague = /^(Submit|OK|Yes|Continue|Next)$/i;
    const verbLike = /^(Approve|Reject|Confirm|Record|Reverse|Create|Save|Edit|Delete|View)/i;
    const violations: { key: string; value: string }[] = [];
    for (const key of ROLE_GATED_ACTION_KEYS) {
      const value = getCopy(key);
      if (vague.test(value.trim()) || !verbLike.test(value.trim())) {
        violations.push({ key, value });
      }
    }
    expect(violations).toEqual([]);
  });

  it('reopen meeting warning mentions consequences clearly', () => {
    const body = getCopy(COPY_KEYS.hub_meeting_reopen_warningBody);
    expect(body.length).toBeGreaterThan(20);
    expect(body.toLowerCase()).toMatch(/reopen|change|audit|record|entr/);
  });

  it('rule change warning mentions consequences (version, effective date, or agreement)', () => {
    const body = getCopy(COPY_KEYS.hub_rule_change_warningBody);
    expect(body.length).toBeGreaterThan(20);
    const lower = body.toLowerCase();
    const hasConsequence =
      lower.includes('version') ||
      lower.includes('effective') ||
      lower.includes('agree') ||
      lower.includes('record') ||
      lower.includes('change');
    expect(hasConsequence).toBe(true);
  });
});
