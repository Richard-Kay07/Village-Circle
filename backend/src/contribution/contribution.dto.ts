import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export const TRANSACTION_MODES = ['CASH', 'BANK_TRANSFER'] as const;
export type TransactionMode = (typeof TRANSACTION_MODES)[number];

/** Single contribution record (API). */
export class RecordContributionDto {
  @ApiProperty({ description: 'Tenant group id' })
  @IsUUID()
  tenantGroupId!: string;

  @ApiProperty({ description: 'Meeting id (optional for ad-hoc)' })
  @IsOptional()
  @IsUUID()
  meetingId?: string;

  @ApiProperty({ description: 'Member (profile) id' })
  @IsUUID()
  memberProfileId!: string;

  @ApiProperty({ enum: TRANSACTION_MODES })
  @IsEnum(TRANSACTION_MODES)
  transactionMode!: TransactionMode;

  @ApiProperty({ description: 'Savings amount in minor units (pence)', minimum: 0 })
  @IsInt()
  @Min(0)
  savingsAmountMinor!: number;

  @ApiProperty({ description: 'Social fund amount in minor units (pence)', minimum: 0 })
  @IsInt()
  @Min(0)
  socialFundAmountMinor!: number;

  @ApiPropertyOptional({ description: 'Text reference for evidence' })
  @IsOptional()
  @IsString()
  externalReferenceText?: string;

  @ApiPropertyOptional({ description: 'Evidence file id (image upload)' })
  @IsOptional()
  @IsUUID()
  evidenceAttachmentId?: string;

  @ApiProperty({ description: 'Idempotency key (required)' })
  @IsString()
  idempotencyKey!: string;

  @ApiPropertyOptional({ description: 'User id of recorder; also used for RBAC (actorUserId)' })
  @IsOptional()
  @IsString()
  recordedByUserId?: string;

  @ApiPropertyOptional({ description: 'Actor user id for permission check (if not same as recordedByUserId)' })
  @IsOptional()
  @IsString()
  actorUserId?: string;
}

/** One item in bulk meeting contribution entry. */
export class BulkContributionItemDto {
  @ApiProperty()
  @IsUUID()
  memberProfileId!: string;

  @ApiProperty({ enum: TRANSACTION_MODES })
  @IsEnum(TRANSACTION_MODES)
  transactionMode!: TransactionMode;

  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  savingsAmountMinor!: number;

  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  socialFundAmountMinor!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  externalReferenceText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  evidenceAttachmentId?: string;

  @ApiProperty()
  @IsString()
  idempotencyKey!: string;
}

/** Bulk contribution entry for a meeting. */
export class BulkRecordContributionsDto {
  @ApiProperty()
  @IsUUID()
  tenantGroupId!: string;

  @ApiProperty()
  @IsUUID()
  meetingId!: string;

  @ApiProperty({ type: [BulkContributionItemDto] })
  contributions!: BulkContributionItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recordedByUserId?: string;

  @ApiPropertyOptional({ description: 'Actor user id for permission check' })
  @IsOptional()
  @IsString()
  actorUserId?: string;
}

/** Reversal request. */
export class ReversalContributionDto {
  @ApiProperty()
  @IsUUID()
  tenantGroupId!: string;

  @ApiProperty()
  @IsUUID()
  contributionId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reversalReason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reversedByUserId?: string;

  @ApiPropertyOptional({ description: 'Actor user id for permission check' })
  @IsOptional()
  @IsString()
  actorUserId?: string;
}
