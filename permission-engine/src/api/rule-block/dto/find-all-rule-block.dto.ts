import { IsOptional, IsUUID, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RuleBlockType } from 'src/lib/type';
import { PaginationDto } from 'src/lib/dto';

export class FindAllRuleBlockDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description:
      'RuleBlock type: {space|space_event}:{general|consent_method|post_event_check|access}',
    type: String,
  })
  type?: RuleBlockType;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({
    description: 'RuleBlock authorId in uuid',
    type: String,
  })
  authorId?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'RuleBlock hash',
    type: String,
  })
  hash?: string;

  @IsOptional()
  @IsUUID('4', { each: true })
  @ApiPropertyOptional({
    description: 'RuleBlock ids',
    type: String,
    isArray: true,
  })
  ids?: string[];
}
