import { validateEvidenceImage } from '@/lib/evidence/upload';

describe('Evidence validation', () => {
  it('invalid file type shows error', () => {
    const file = new File(['x'], 'doc.pdf', { type: 'application/pdf' });
    const err = validateEvidenceImage(file);
    expect(err).toContain('JPEG');
  });

  it('oversize file shows error', () => {
    const bigFile = new File([new ArrayBuffer(11 * 1024 * 1024)], 'big.jpg', { type: 'image/jpeg' });
    const err = validateEvidenceImage(bigFile);
    expect(err).toContain('too large');
  });

  it('valid image type passes', () => {
    expect(validateEvidenceImage(new File([], 'a.jpg', { type: 'image/jpeg' }))).toBeNull();
    expect(validateEvidenceImage(new File([], 'a.png', { type: 'image/png' }))).toBeNull();
  });
});
