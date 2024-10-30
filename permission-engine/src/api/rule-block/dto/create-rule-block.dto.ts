import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { RuleBlockType } from 'src/lib/type';

export class CreateRuleBlockDto {
  @IsOptional()
  @IsUUID('4')
  id?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @ApiProperty({ description: 'RuleBlock name', required: true })
  name: string;

  @IsString()
  @ApiProperty({
    description:
      'RuleBlock type: {space|space_event}:{general|consent_method|access|max_attendee|max_noise_level|availability|availability_unit|availability_buffer|pre_permission_check|post_event_check|access|require_equipment|expected_attendee_count|exception|benefit|risk|self_risk_assesment|insurance|noise_level|pre_permission_check_answer}',
    required: true,
  })
  type: RuleBlockType;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'RuleBlock content: Send empty if file exists',
    nullable: true,
  })
  content?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(1)
  @ApiPropertyOptional({
    description: 'SpaceEvent files in jpeg|jpg|png|pdf',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    maxItems: 1,
  })
  files?: Express.Multer.File[];
}
