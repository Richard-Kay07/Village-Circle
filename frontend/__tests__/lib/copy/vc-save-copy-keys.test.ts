/**
 * Validates that all core VC Save copy keys exist and have non-empty messages.
 * Covers: dashboard, statement buckets, transaction mode, evidence, batch review,
 * meeting entry, reversal, statements, empty/error states.
 *
 * @see docs/VC_SAVE_COPY_SPEC.md
 */

import { COPY_KEYS, getCopy, messages } from '@/lib/copy';
import type { CopyKey } from '@/lib/copy';

/** Keys that must exist for VC Save core screens (spec-driven) */
const VC_SAVE_CORE_KEYS: CopyKey[] = [
  COPY_KEYS.save_dashboard_card_title,
  COPY_KEYS.save_dashboard_card_description,
  COPY_KEYS.save_dashboard_card_description_short,
  COPY_KEYS.save_mvp_perimeter,
  COPY_KEYS.save_bucket_savings,
  COPY_KEYS.save_bucket_socialFund,
  COPY_KEYS.save_bucket_loanPrincipal,
  COPY_KEYS.save_bucket_interest,
  COPY_KEYS.save_bucket_penalties,
  COPY_KEYS.save_contribution_recordType,
  COPY_KEYS.save_transactionMode_label,
  COPY_KEYS.save_transactionMode_cash,
  COPY_KEYS.save_transactionMode_cashShort,
  COPY_KEYS.save_transactionMode_bank,
  COPY_KEYS.save_transactionMode_bankShort,
  COPY_KEYS.save_transactionMode_hint,
  COPY_KEYS.save_externalRef_placeholder,
  COPY_KEYS.save_externalRef_hintBank,
  COPY_KEYS.save_externalRef_hintCash,
  COPY_KEYS.save_evidence_label,
  COPY_KEYS.save_evidence_uploadHelper,
  COPY_KEYS.save_evidence_lockedExplanation,
  COPY_KEYS.save_evidence_optionalDetail,
  COPY_KEYS.save_batch_summaryTitle,
  COPY_KEYS.save_batch_savingsTotal,
  COPY_KEYS.save_batch_socialFundTotal,
  COPY_KEYS.save_batch_totalCollected,
  COPY_KEYS.save_batch_cashCount,
  COPY_KEYS.save_batch_bankCount,
  COPY_KEYS.save_batch_willBeRecorded,
  COPY_KEYS.save_batch_submitting,
  COPY_KEYS.save_contribution_success,
  COPY_KEYS.save_reconciliation_heading,
  COPY_KEYS.save_reconciliation_disclaimer,
  COPY_KEYS.member_dashboard_title,
  COPY_KEYS.member_dashboard_savingsTotal,
  COPY_KEYS.member_dashboard_socialFundTotal,
  COPY_KEYS.member_statements_title,
  COPY_KEYS.member_statements_noEntries,
  COPY_KEYS.member_statements_emptyDescription,
  COPY_KEYS.member_statements_errorLoad,
  COPY_KEYS.ops_meeting_entry_title,
  COPY_KEYS.ops_meeting_entry_backToMeetings,
  COPY_KEYS.ops_meeting_entry_helpText,
  COPY_KEYS.ops_meeting_entry_savingsLabel,
  COPY_KEYS.ops_meeting_entry_socialFundLabel,
  COPY_KEYS.ops_meeting_entry_totalLabel,
  COPY_KEYS.ops_meeting_entry_markAbsent,
  COPY_KEYS.ops_meeting_entry_includeMember,
  COPY_KEYS.ops_meeting_entry_reviewSubmit,
  COPY_KEYS.ops_meeting_entry_submitBatch,
  COPY_KEYS.ops_meeting_entry_noMembersTitle,
  COPY_KEYS.ops_meeting_entry_noMembersDescription,
  COPY_KEYS.ops_meeting_entry_errorLoadMembers,
  COPY_KEYS.ops_meeting_detail_title,
  COPY_KEYS.ops_meeting_detail_addMoreEntries,
  COPY_KEYS.ops_meeting_detail_errorLoad,
  COPY_KEYS.ops_meeting_detail_totalsHeading,
  COPY_KEYS.ops_contribution_reverse,
  COPY_KEYS.ops_contribution_reversalDialogTitle,
  COPY_KEYS.immutable_reversalExplanation,
  COPY_KEYS.immutable_recordReversedMessage,
];

describe('VC Save copy keys', () => {
  it('every VC Save core key exists in COPY_KEYS and has a non-empty message', () => {
    const missing: string[] = [];
    const empty: string[] = [];
    for (const key of VC_SAVE_CORE_KEYS) {
      const msg = messages[key];
      if (msg === undefined) missing.push(key);
      else if (typeof msg === 'string' && msg.length === 0) empty.push(key);
    }
    expect(missing).toEqual([]);
    expect(empty).toEqual([]);
  });

  it('getCopy returns a non-empty string for every VC Save core key', () => {
    for (const key of VC_SAVE_CORE_KEYS) {
      expect(getCopy(key)).toBeTruthy();
      expect(typeof getCopy(key)).toBe('string');
    }
  });

  it('savings and social fund are distinct in batch copy', () => {
    const savingsLabel = getCopy(COPY_KEYS.save_batch_savingsTotal);
    const socialLabel = getCopy(COPY_KEYS.save_batch_socialFundTotal);
    expect(savingsLabel.toLowerCase()).toContain('savings');
    expect(socialLabel.toLowerCase()).toContain('social');
    expect(savingsLabel).not.toBe(socialLabel);
  });
});
