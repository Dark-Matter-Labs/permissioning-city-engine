import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class UpdateRuleDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @ApiProperty({ description: 'Rule name', required: true })
  name?: string;

  @IsOptional()
  @IsUUID('4', { each: true })
  @ApiProperty({ description: 'Array of ruleBlockIds', required: true })
  ruleBlockIds?: string[];
}
