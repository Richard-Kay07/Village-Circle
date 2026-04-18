import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, Min, Max, IsIn } from 'class-validator';

const BASIS = ['FLAT', 'SIMPLE_DECLINING'] as const;

export class CreateRuleVersionDto {
  @ApiProperty()
  @IsUUID()
  tenantGroupId!: string;

  @ApiProperty()
  @IsBoolean()
  loanInterestEnabled!: boolean;

  @ApiProperty({ description: 'Interest rate in basis points (e.g. 500 = 5%)', minimum: 0, maximum: 100000 })
  @IsInt()
  @Min(0)
  @Max(100000)
  loanInterestRateBps!: number;

  @ApiProperty({ enum: BASIS })
  @IsIn(BASIS)
  loanInterestBasis!: 'FLAT' | 'SIMPLE_DECLINING';

  @ApiProperty()
  @IsBoolean()
  penaltyEnabled!: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  penaltyRule?: Record<string, unknown> | null;

  @ApiProperty()
  @IsBoolean()
  socialFundEnabled!: boolean;

  @ApiProperty()
  @IsBoolean()
  smsNotificationsEnabled!: boolean;

  @ApiProperty({ description: 'Tenant cost control: allow receipt confirmation SMS' })
  @IsBoolean()
  smsReceiptConfirmationEnabled!: boolean;

  @ApiProperty()
  @IsString()
  createdByUserId!: string;
}

export class UpdateRuleVersionDto {
  @ApiProperty()
  @IsUUID()
  tenantGroupId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  loanInterestEnabled?: boolean;

  @ApiPropertyOptional({ minimum: 0, maximum: 100000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100000)
  loanInterestRateBps?: number;

  @ApiPropertyOptional({ enum: BASIS })
  @IsOptional()
  @IsIn(BASIS)
  loanInterestBasis?: 'FLAT' | 'SIMPLE_DECLINING';

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  penaltyEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  penaltyRule?: Record<string, unknown> | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  socialFundEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  smsNotificationsEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Tenant cost control: allow receipt confirmation SMS' })
  @IsOptional()
  @IsBoolean()
  smsReceiptConfirmationEnabled?: boolean;

  @ApiProperty()
  @IsString()
  updatedByUserId!: string;
}
