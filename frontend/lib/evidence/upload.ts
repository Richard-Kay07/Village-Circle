import { apiClient } from '@/lib/api/client';

export const ALLOWED_EVIDENCE_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;
export const MAX_EVIDENCE_SIZE_BYTES = 10 * 1024 * 1024;

export function validateEvidenceImage(file: File): string | null {
  if (!ALLOWED_EVIDENCE_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_EVIDENCE_IMAGE_TYPES)[number])) {
    return 'Please choose a JPEG, PNG, GIF or WebP image.';
  }
  if (file.size > MAX_EVIDENCE_SIZE_BYTES) {
    return 'Image is too large. Maximum size is 10 MB.';
  }
  return null;
}

export interface RegisterEvidenceParams {
  groupId: string;
  storedPath: string;
  mimeType: string;
  sizeBytes: number;
  uploadedByMemberId: string;
  actorMemberId: string;
}

/**
 * Register an evidence file with the backend (POST /evidence).
 * Actual file upload to storage is out-of-band in MVP: caller must obtain storedPath first
 * (e.g. from an upload API or placeholder). This helper validates and calls register.
 */
export async function registerEvidence(
  params: RegisterEvidenceParams,
  options?: { apiBaseUrl?: string }
): Promise<{ id: string }> {
  if (!ALLOWED_EVIDENCE_IMAGE_TYPES.includes(params.mimeType as (typeof ALLOWED_EVIDENCE_IMAGE_TYPES)[number])) {
    throw new Error('Unsupported file type. Use JPEG, PNG, GIF or WebP.');
  }
  const client = options?.apiBaseUrl ? (await import('@/lib/api/client')).createApiClient({ baseUrl: options.apiBaseUrl }) : apiClient;
  return client.post<{ id: string }>(
    'evidence',
    {
      groupId: params.groupId,
      storedPath: params.storedPath,
      mimeType: params.mimeType,
      sizeBytes: params.sizeBytes,
      uploadedByMemberId: params.uploadedByMemberId,
      actorMemberId: params.actorMemberId,
    },
    { tenantGroupId: params.groupId, actorMemberId: params.actorMemberId }
  );
}

/**
 * Upload flow adapter: validate file, then upload to storage (placeholder: use file name as path),
 * then register. Replace uploadToStorage with real implementation (e.g. presigned URL).
 */
export async function uploadAndRegisterEvidence(
  file: File,
  params: { groupId: string; uploadedByMemberId: string; actorMemberId: string },
  uploadToStorage?: (file: File) => Promise<string>
): Promise<{ id: string }> {
  const err = validateEvidenceImage(file);
  if (err) throw new Error(err);
  const storedPath = uploadToStorage
    ? await uploadToStorage(file)
    : `uploads/${params.groupId}/${Date.now()}-${file.name}`;
  return registerEvidence({
    groupId: params.groupId,
    storedPath,
    mimeType: file.type,
    sizeBytes: file.size,
    uploadedByMemberId: params.uploadedByMemberId,
    actorMemberId: params.actorMemberId,
  });
}
