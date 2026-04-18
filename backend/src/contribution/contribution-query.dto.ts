import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsDateString, IsUUID } from 'class-validator';

export class ContributionQueryFiltersDto {
  @ApiPropertyOptional({ description: 'Filter from date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter to date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Filter by meeting id' })
  @IsOptional()
  @IsUUID()
  meetingId?: string;

  @ApiPropertyOptional({ description: 'Filter by member id' })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @ApiPropertyOptional({ enum: ['CASH', 'BANK_TRANSFER'] })
  @IsOptional()
  @IsEnum(['CASH', 'BANK_TRANSFER'])
  transactionMode?: 'CASH' | 'BANK_TRANSFER';

  @ApiPropertyOptional({ enum: ['SAVINGS', 'SOCIAL_FUND'], description: 'Filter contributions with this bucket > 0' })
  @IsOptional()
  @IsEnum(['SAVINGS', 'SOCIAL_FUND'])
  fundBucket?: 'SAVINGS' | 'SOCIAL_FUND';

  @ApiPropertyOptional({ enum: ['RECORDED', 'REVERSED'] })
  @IsOptional()
  @IsEnum(['RECORDED', 'REVERSED'])
  status?: 'RECORDED' | 'REVERSED';
}
