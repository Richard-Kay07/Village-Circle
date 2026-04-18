import {
  getStatusVocabulary,
  getAuditActionLabel,
  getStatusLabelAndId,
  type StatusDomain,
} from '@/lib/status-vocabulary';

describe('status-vocabulary', () => {
  describe('getStatusVocabulary', () => {
    it('returns contribution status vocab with RECORDED and REVERSED', () => {
      const vocab = getStatusVocabulary('contribution' as StatusDomain);
      expect(vocab.RECORDED).toEqual({ label: 'Recorded', statusId: 'recorded' });
      expect(vocab.REVERSED).toEqual({ label: 'Reversed', statusId: 'reversed' });
    });

    it('returns loan status vocab with PENDING, APPROVED, REPAID', () => {
      const vocab = getStatusVocabulary('loan' as StatusDomain);
      expect(vocab.PENDING).toEqual({ label: 'Pending', statusId: 'pending' });
      expect(vocab.APPROVED).toEqual({ label: 'Approved', statusId: 'approved' });
      expect(vocab.REPAID).toEqual({ label: 'Repaid', statusId: 'recorded' });
    });

    it('returns repayment status vocab', () => {
      const vocab = getStatusVocabulary('repayment' as StatusDomain);
      expect(vocab.RECORDED).toBeDefined();
      expect(vocab.RECORDED?.label).toBe('Recorded');
      expect(vocab.FAILED).toBeDefined();
      expect(vocab.FAILED?.statusId).toBe('failed');
    });

    it('returns notification status vocab with DELIVERED and FAILED', () => {
      const vocab = getStatusVocabulary('notification' as StatusDomain);
      expect(vocab.DELIVERED).toEqual({ label: 'Delivered', statusId: 'delivered' });
      expect(vocab.FAILED).toEqual({ label: 'Failed', statusId: 'failed' });
    });

    it('returns evidence status vocab', () => {
      const vocab = getStatusVocabulary('evidence' as StatusDomain);
      expect(vocab.ATTACHED).toEqual({ label: 'Attached', statusId: 'recorded' });
    });

    it('returns admin_support status vocab', () => {
      const vocab = getStatusVocabulary('admin_support' as StatusDomain);
      expect(vocab.STARTED).toBeDefined();
      expect(vocab.EVIDENCE_VIEWED).toBeDefined();
    });
  });

  describe('getAuditActionLabel', () => {
    it('maps known action keys to labels', () => {
      expect(getAuditActionLabel('CONTRIBUTION_RECORDED')).toBe('Contribution recorded');
      expect(getAuditActionLabel('CONTRIBUTION_REVERSED')).toBe('Contribution reversed');
      expect(getAuditActionLabel('LOAN_APPROVED')).toBe('Loan approved');
      expect(getAuditActionLabel('SMS_WEBHOOK_DELIVERED')).toBe('SMS delivered');
      expect(getAuditActionLabel('SMS_WEBHOOK_FAILED')).toBe('SMS delivery failed');
      expect(getAuditActionLabel('SUPPORT_EVIDENCE_VIEWED')).toBe('Evidence viewed (support)');
    });

    it('returns formatted fallback for unknown action key', () => {
      expect(getAuditActionLabel('SOME_UNKNOWN_ACTION')).toBe('Some unknown action');
    });
  });

  describe('getStatusLabelAndId', () => {
    it('resolves contribution RECORDED and REVERSED to label and statusId', () => {
      expect(getStatusLabelAndId('contribution', 'RECORDED')).toEqual({ label: 'Recorded', statusId: 'recorded' });
      expect(getStatusLabelAndId('contribution', 'REVERSED')).toEqual({ label: 'Reversed', statusId: 'reversed' });
    });

    it('resolves loan statuses', () => {
      expect(getStatusLabelAndId('loan', 'PENDING')).toEqual({ label: 'Pending', statusId: 'pending' });
      expect(getStatusLabelAndId('loan', 'APPROVED')).toEqual({ label: 'Approved', statusId: 'approved' });
    });

    it('returns undefined for unknown raw status', () => {
      expect(getStatusLabelAndId('contribution', 'UNKNOWN')).toBeUndefined();
    });
  });
});
