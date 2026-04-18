import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IAttachmentsService, RegisterAttachmentParams, AttachmentMetadata } from './attachments.interface';

/**
 * Attachments service skeleton. No persistence yet.
 */
@Injectable()
export class AttachmentsService implements IAttachmentsService {
  async register(_params: RegisterAttachmentParams): Promise<{ id: string }> {
    return { id: uuidv4() };
  }

  async getById(_id: string): Promise<AttachmentMetadata | null> {
    return null;
  }
}
