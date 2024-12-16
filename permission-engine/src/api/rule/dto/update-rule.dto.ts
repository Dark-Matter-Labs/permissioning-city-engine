import { ApiHideProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class UpdateRuleDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @ApiPropertyOptional({ description: 'Rule name', required: true })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'RuleBlock details',
    nullable: true,
  })
  details?: string;

  @IsOptional()
  @IsUUID('4', { each: true })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ApiPropertyOptional({ description: 'Array of ruleBlockIds', required: true })
  ruleBlockIds?: string[];

  @IsOptional()
  @IsString()
  @ApiHideProperty()
  hash?: string;
}
