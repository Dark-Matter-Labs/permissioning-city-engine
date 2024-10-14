import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { RuleTarget } from 'src/lib/type';

export class CreateRuleDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @ApiProperty({ description: 'Rule name', required: true })
  name: string;

  @IsOptional()
  @IsUUID('4')
  @ApiPropertyOptional({ description: 'Rule parentRuleId in uuid' })
  parentRuleId?: string;

  @IsString()
  @ApiProperty({
    description: 'Rule target: space|space_event',
    required: true,
  })
  target: RuleTarget;

  @IsUUID('4', { each: true })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ApiProperty({ description: 'Array of ruleBlockIds', required: true })
  ruleBlockIds: string[];
}
