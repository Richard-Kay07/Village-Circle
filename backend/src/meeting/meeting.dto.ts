import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateMeetingDto {
  @ApiProperty()
  @IsUUID()
  tenantGroupId!: string;

  @ApiProperty({ description: 'Meeting date/time (ISO)' })
  @IsDateString()
  heldAt!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  createdByUserId?: string;
}
