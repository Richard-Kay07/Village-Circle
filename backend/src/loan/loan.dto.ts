import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class SubmitApplicationDto {
  @ApiProperty()
  @IsUUID()
  tenantGroupId!: string;
  @ApiProperty()
  @IsUUID()
  memberProfileId!: string;
  @ApiProperty()
  @IsInt()
  @Min(1)
  requestedAmountMinor!: number;
  @ApiProperty()
  @IsInt()
  @Min(1)
  requestedTermPeriods!: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  purpose?: string;
  @ApiProperty()
  @IsString()
  submittedByUserId!: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  actorUserId?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  actorMemberId?: string;
}

export class ApproveApplicationDto {
  @ApiProperty()
  @IsUUID()
  applicationId!: string;
  @ApiProperty()
  @IsUUID()
  tenantGroupId!: string;
  @ApiProperty()
  @IsString()
  approvedByUserId!: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  actorUserId?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  actorMemberId?: string;
}

export class RecordDisbursementDto {
  @ApiProperty()
  @IsUUID()
  loanId!: string;
  @ApiProperty()
  @IsUUID()
  tenantGroupId!: string;
  @ApiProperty({ enum: ['CASH', 'BANK_TRANSFER'] })
  transactionMode!: 'CASH' | 'BANK_TRANSFER';
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
  recordedByUserId!: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  actorUserId?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  actorMemberId?: string;
}

export class RecordRepaymentDto {
  @ApiProperty()
  @IsUUID()
  loanId!: string;
  @ApiProperty()
  @IsUUID()
  tenantGroupId!: string;
  @ApiProperty({ enum: ['CASH', 'BANK_TRANSFER'] })
  transactionMode!: 'CASH' | 'BANK_TRANSFER';
  @ApiProperty()
  @IsInt()
  @Min(1)
  amountMinor!: number;
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
  recordedByUserId!: string;
  @ApiProperty()
  @IsString()
  idempotencyKey!: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  actorUserId?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  actorMemberId?: string;
}

export class RecordWaiverDto {
  @ApiProperty()
  @IsUUID()
  loanId!: string;
  @ApiProperty()
  @IsUUID()
  tenantGroupId!: string;
  @ApiProperty()
  @IsString()
  reason!: string;
  @ApiProperty()
  @IsString()
  approvedByUserId!: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  scheduleItemId?: string;
  @ApiProperty()
  @IsInt()
  @Min(0)
  amountMinorWaived!: number;
  @ApiPropertyOptional({ enum: ['PENALTY', 'INTEREST', 'BOTH'] })
  @IsOptional()
  @IsString()
  waiverType?: 'PENALTY' | 'INTEREST' | 'BOTH';
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  actorUserId?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  actorMemberId?: string;
}

export class RecordRescheduleDto {
  @ApiProperty()
  @IsUUID()
  loanId!: string;
  @ApiProperty()
  @IsUUID()
  tenantGroupId!: string;
  @ApiProperty()
  @IsString()
  reason!: string;
  @ApiProperty()
  @IsString()
  approvedByUserId!: string;
  @ApiProperty()
  @IsInt()
  @Min(1)
  newTermPeriods!: number;
  @ApiProperty({ description: 'First due date of the new schedule (ISO date)' })
  firstDueDate!: Date;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  actorUserId?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  actorMemberId?: string;
}

export class RecordWriteOffDto {
  @ApiProperty()
  @IsUUID()
  loanId!: string;
  @ApiProperty()
  @IsUUID()
  tenantGroupId!: string;
  @ApiProperty()
  @IsString()
  reason!: string;
  @ApiProperty()
  @IsString()
  approvedByUserId!: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  actorUserId?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  actorMemberId?: string;
}
