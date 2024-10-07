import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';
import { RuleTarget } from 'src/lib/type';

export class CreateRuleDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @ApiProperty({ description: 'Rule name', required: true })
  name: string;

  @IsUUID('4')
  @ApiProperty({ description: 'Rule authorId in uuid', required: true })
  authorId: string;

  @IsUUID('4')
  @ApiProperty({ description: 'Rule parentRuleId in uuid' })
  parentRuleId?: string;

  @IsString()
  @ApiProperty({
    description: 'Rule target: space|space_event',
    required: true,
  })
  target: RuleTarget;

  @IsUUID('4', { each: true })
  @ApiProperty({ description: 'Array of ruleBlockIds', required: true })
  ruleBlockIds: string[];
}
