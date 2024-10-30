import { IsOptional, IsUUID, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RuleTarget } from 'src/lib/type';
import { PaginationDto } from 'src/lib/dto';

export class FindAllRuleDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({
    description: 'Rule ids',
  })
  ids?: string[];

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Rule target: space|space_event',
    type: String,
  })
  target?: RuleTarget;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({
    description: 'Rule authorId in uuid',
    type: String,
  })
  authorId?: string;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({
    description: 'Rule parentRuleId in uuid',
    type: String,
  })
  parentRuleId?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Rule hash',
    type: String,
  })
  hash?: string;
}
