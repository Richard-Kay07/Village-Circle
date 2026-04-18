import { validateEvidenceImage, registerEvidence } from '@/lib/evidence/upload';

describe('validateEvidenceImage', () => {
  it('returns null for allowed image types', () => {
    expect(validateEvidenceImage(new File([], 'a.jpg', { type: 'image/jpeg' }))).toBeNull();
    expect(validateEvidenceImage(new File([], 'a.png', { type: 'image/png' }))).toBeNull();
  });
  it('returns error for disallowed mime type', () => {
    expect(validateEvidenceImage(new File([], 'a.pdf', { type: 'application/pdf' }))).toContain('JPEG');
  });
  it('returns error when file too large', () => {
    const big = new File([new ArrayBuffer(11 * 1024 * 1024)], 'big.jpg', { type: 'image/jpeg' });
    expect(validateEvidenceImage(big)).toContain('too large');
  });
});

describe('registerEvidence', () => {
  it('throws when mime type not in allowed list', async () => {
    await expect(
      registerEvidence({
        groupId: 'g1',
        storedPath: '/p',
        mimeType: 'application/pdf',
        sizeBytes: 100,
        uploadedByMemberId: 'm1',
        actorMemberId: 'm1',
      })
    ).rejects.toThrow('Unsupported file type');
  });
});
