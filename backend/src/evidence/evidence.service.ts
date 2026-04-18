import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GroupService } from '../group/group.service';
import { AuditLogService, SupportAccessReasonRequiredError } from '../audit/audit-log.service';
import { AuditChannel } from '../domain/enums';

export interface RegisterEvidenceFileDto {
  groupId: string;
  storedPath: string;
  mimeType: string;
  sizeBytes: number;
  uploadedByMemberId: string;
  actorMemberId: string;
}

export interface EvidenceSupportAccessDto {
  reasonCode: string;
  supportCaseOrIncidentId: string;
  actorUserId: string;
  tenantGroupId: string;
}

@Injectable()
export class EvidenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groupService: GroupService,
    private readonly auditLog: AuditLogService,
  ) {}

  /**
   * Register an evidence file (actual upload is out-of-band; MVP stores path reference).
   */
  async register(dto: RegisterEvidenceFileDto): Promise<{ id: string }> {
    await this.groupService.assertActiveMember(dto.groupId, dto.actorMemberId);
    const file = await this.prisma.evidenceFile.create({
      data: {
        groupId: dto.groupId,
        storedPath: dto.storedPath,
        mimeType: dto.mimeType,
        sizeBytes: dto.sizeBytes,
        uploadedBy: dto.uploadedByMemberId,
      },
    });
    return { id: file.id };
  }

  async getById(fileId: string, actorMemberId: string): Promise<{
    id: string;
    groupId: string;
    storedPath: string;
    mimeType: string;
    sizeBytes: number;
    createdAt: Date;
  }> {
    const file = await this.prisma.evidenceFile.findUnique({
      where: { id: fileId },
    });
    if (!file) throw new NotFoundException('Evidence file not found');
    await this.groupService.assertActiveMember(file.groupId, actorMemberId);
    return {
      id: file.id,
      groupId: file.groupId,
      storedPath: file.storedPath,
      mimeType: file.mimeType,
      sizeBytes: file.sizeBytes,
      createdAt: file.createdAt,
    };
  }

  /**
   * Support/admin view of evidence: requires reason code and case id, logs audit then returns metadata.
   */
  async getByIdForSupport(fileId: string, dto: EvidenceSupportAccessDto): Promise<{
    id: string;
    groupId: string;
    storedPath: string;
    mimeType: string;
    sizeBytes: number;
    createdAt: Date;
  }> {
    if (!dto.reasonCode?.trim() || !dto.supportCaseOrIncidentId?.trim()) {
      throw new SupportAccessReasonRequiredError();
    }
    await this.auditLog.logSupportAccess({
      supportCaseOrIncidentId: dto.supportCaseOrIncidentId,
      reasonCode: dto.reasonCode,
      actorUserId: dto.actorUserId,
      tenantGroupId: dto.tenantGroupId,
      channel: AuditChannel.ADMIN_PORTAL,
      action: 'EVIDENCE_VIEW',
      metadata: { evidenceFileId: fileId },
    });
    const file = await this.prisma.evidenceFile.findUnique({ where: { id: fileId } });
    if (!file) throw new NotFoundException('Evidence file not found');
    if (file.groupId !== dto.tenantGroupId) throw new NotFoundException('Evidence file not found');
    return {
      id: file.id,
      groupId: file.groupId,
      storedPath: file.storedPath,
      mimeType: file.mimeType,
      sizeBytes: file.sizeBytes,
      createdAt: file.createdAt,
    };
  }
}
