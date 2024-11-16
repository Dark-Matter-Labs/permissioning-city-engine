import {
  IsOptional,
  IsUUID,
  IsString,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RuleTarget } from 'src/lib/type';
import { PaginationDto } from 'src/lib/dto';
import { Transform } from 'class-transformer';

export class FindAllRuleDto extends PaginationDto {
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  @IsArray()
  @IsUUID('4', { each: true })
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
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'Rule is active status',
    type: 'boolean',
  })
  isActive?: boolean;

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
