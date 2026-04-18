import { AttachmentType } from '../domain/enums';

/**
 * Attachments module interfaces (skeleton). No business logic in Phase 1.1.
 */

export interface IAttachmentsService {
  /** Register an attachment reference (stub). */
  register(params: RegisterAttachmentParams): Promise<{ id: string }>;
  /** Get attachment metadata by id (stub). */
  getById(id: string): Promise<AttachmentMetadata | null>;
}

export interface RegisterAttachmentParams {
  tenantGroupId: string;
  type: AttachmentType;
  storedPath: string;
  mimeType: string;
  sizeBytes: number;
  uploadedByUserId: string;
}

export interface AttachmentMetadata {
  id: string;
  tenantGroupId: string;
  type: AttachmentType;
  storedPath: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: Date;
}
