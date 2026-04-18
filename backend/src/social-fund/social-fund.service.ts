import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { GroupService } from '../group/group.service';
import { AuditEntityType, SocialFundEntryType } from '@prisma/client';
import { toDecimal } from '../common/decimal';

export interface CreateBucketDto {
  groupId: string;
  name: string;
  actorMemberId: string;
}

export interface PostSocialFundEntryDto {
  bucketId: string;
  amount: number; // positive = contribution, negative = disbursement
  type: 'CONTRIBUTION' | 'DISBURSEMENT';
  idempotencyKey?: string;
  evidenceType?: 'TEXT_REFERENCE' | 'IMAGE_UPLOAD';
  evidenceReference?: string;
  evidenceFileId?: string;
  actorMemberId: string;
}

export interface ReversalSocialFundEntryDto {
  groupId: string;
  bucketId: string;
  entryId: string;
  reason?: string;
  actorMemberId: string;
}

@Injectable()
export class SocialFundService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly groupService: GroupService,
  ) {}

  async createBucket(dto: CreateBucketDto): Promise<{ id: string }> {
    await this.groupService.assertAdmin(dto.groupId, dto.actorMemberId);
    const group = await this.prisma.group.findUnique({ where: { id: dto.groupId } });
    if (!group) throw new NotFoundException('Group not found');
    const bucket = await this.prisma.socialFundBucket.create({
      data: { groupId: dto.groupId, name: dto.name },
    });
    await this.audit.emit({
      groupId: dto.groupId,
      entityType: AuditEntityType.SOCIAL_FUND_BUCKET,
      entityId: bucket.id,
      action: 'CREATED',
      actorId: dto.actorMemberId,
      payload: { name: bucket.name },
    });
    return { id: bucket.id };
  }

  async postEntry(dto: PostSocialFundEntryDto): Promise<{ id: string; createdAt: Date }> {
    const bucket = await this.prisma.socialFundBucket.findUnique({
      where: { id: dto.bucketId },
      include: { group: true },
    });
    if (!bucket) throw new NotFoundException('Bucket not found');
    await this.groupService.assertActiveMember(bucket.groupId, dto.actorMemberId);

    if (dto.type === 'CONTRIBUTION' && dto.amount <= 0) {
      throw new BadRequestException('Contribution amount must be positive');
    }
    if (dto.type === 'DISBURSEMENT' && dto.amount >= 0) {
      throw new BadRequestException('Disbursement amount must be negative');
    }
    const amount = dto.type === 'CONTRIBUTION' ? dto.amount : -Math.abs(dto.amount);
    const idempotencyKey = dto.idempotencyKey ?? null;
    if (idempotencyKey) {
      const existing = await this.prisma.socialFundEntry.findFirst({
        where: { bucketId: dto.bucketId, idempotencyKey },
      });
      if (existing) {
        if (existing.amount.toNumber() !== amount) {
          throw new BadRequestException('Idempotency key already used with different payload');
        }
        return { id: existing.id, createdAt: existing.createdAt };
      }
    }

    const auditId = await this.audit.emit({
      groupId: bucket.groupId,
      entityType: AuditEntityType.SOCIAL_FUND_ENTRY,
      entityId: '',
      action: 'CREATED',
      actorId: dto.actorMemberId,
      payload: { bucketId: dto.bucketId, amount, type: dto.type, idempotencyKey },
    });

    const entry = await this.prisma.socialFundEntry.create({
      data: {
        bucketId: dto.bucketId,
        amount: toDecimal(amount),
        type: dto.type === 'CONTRIBUTION' ? SocialFundEntryType.CONTRIBUTION : SocialFundEntryType.DISBURSEMENT,
        idempotencyKey,
        evidenceType: dto.evidenceType ?? null,
        evidenceReference: dto.evidenceReference ?? null,
        evidenceFileId: dto.evidenceFileId ?? null,
        createdByMemberId: dto.actorMemberId,
        auditEventId: auditId,
      },
    });

    await this.prisma.auditEvent.update({
      where: { id: auditId },
      data: { entityId: entry.id },
    });

    return { id: entry.id, createdAt: entry.createdAt };
  }

  async reversalEntry(dto: ReversalSocialFundEntryDto): Promise<{ id: string; createdAt: Date }> {
    const entry = await this.prisma.socialFundEntry.findUnique({
      where: { id: dto.entryId },
      include: { bucket: { include: { group: true } } },
    });
    if (!entry || entry.bucketId !== dto.bucketId) throw new NotFoundException('Entry not found');
    if (entry.bucket.groupId !== dto.groupId) throw new ForbiddenException('Bucket not in group');
    await this.groupService.assertAdmin(dto.groupId, dto.actorMemberId);
    if (entry.type !== SocialFundEntryType.CONTRIBUTION && entry.type !== SocialFundEntryType.DISBURSEMENT) {
      throw new BadRequestException('Only CONTRIBUTION or DISBURSEMENT can be reversed');
    }

    const auditId = await this.audit.emit({
      groupId: entry.bucket.groupId,
      entityType: AuditEntityType.SOCIAL_FUND_ENTRY,
      entityId: dto.entryId,
      action: 'REVERSED',
      actorId: dto.actorMemberId,
      payload: { reason: dto.reason },
    });

    const reversalAmount = -entry.amount.toNumber();
    const reversal = await this.prisma.socialFundEntry.create({
      data: {
        bucketId: dto.bucketId,
        amount: toDecimal(reversalAmount),
        type: SocialFundEntryType.REVERSAL,
        idempotencyKey: null,
        createdByMemberId: dto.actorMemberId,
        auditEventId: auditId,
      },
    });
    return { id: reversal.id, createdAt: reversal.createdAt };
  }

  async listBuckets(groupId: string, actorMemberId: string): Promise<Array<{ id: string; name: string; balance: number }>> {
    await this.groupService.assertActiveMember(groupId, actorMemberId);
    const buckets = await this.prisma.socialFundBucket.findMany({
      where: { groupId },
      include: { entries: true },
      orderBy: { createdAt: 'asc' },
    });
    return buckets.map((b) => ({
      id: b.id,
      name: b.name,
      balance: b.entries.reduce((s, e) => s + e.amount.toNumber(), 0),
    }));
  }

  async listEntries(bucketId: string, actorMemberId: string): Promise<Array<{
    id: string;
    amount: number;
    type: string;
    createdAt: Date;
  }>> {
    const bucket = await this.prisma.socialFundBucket.findUnique({
      where: { id: bucketId },
      include: { entries: true },
    });
    if (!bucket) throw new NotFoundException('Bucket not found');
    await this.groupService.assertActiveMember(bucket.groupId, actorMemberId);
    return bucket.entries
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((e) => ({
        id: e.id,
        amount: e.amount.toNumber(),
        type: e.type,
        createdAt: e.createdAt,
      }));
  }
}
