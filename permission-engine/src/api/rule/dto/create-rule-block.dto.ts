import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';
import { RuleBlockType } from 'src/lib/type';

export class CreateRuleBlockDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @ApiProperty({ description: 'RuleBlock name', required: true })
  name: string;

  @IsUUID('4')
  @ApiProperty({ description: 'RuleBlock authorId in uuid', required: true })
  authorId: string;

  @IsString()
  @ApiProperty({
    description:
      'RuleBlock type: {space|space_event}:{general|consent_method|post_event_check|access}',
    required: true,
  })
  type: RuleBlockType;

  @IsString()
  @ApiProperty({ description: 'RuleBlock content', required: true })
  content: string;
}
