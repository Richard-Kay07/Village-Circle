import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AttachmentsService } from './attachments.service';
import { AttachmentType } from '../domain/enums';

@ApiTags('attachments')
@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post()
  register(): Promise<{ id: string }> {
    return this.attachmentsService.register({
      tenantGroupId: '',
      type: AttachmentType.OTHER,
      storedPath: '',
      mimeType: 'application/octet-stream',
      sizeBytes: 0,
      uploadedByUserId: '',
    });
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.attachmentsService.getById(id);
  }
}
