import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from 'src/lib/dto';
import { SpaceApprovedRuleSortBy } from 'src/lib/type';
import { Transform } from 'class-transformer';

export class FindAllSpaceApprovedRuleDto extends PaginationDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: 'SpaceApprovedRule spaceId in uuid',
    type: String,
  })
  spaceId: string;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({
    description: 'SpaceApprovedRule ruleId in uuid',
    type: String,
  })
  ruleId?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'SpaceApprovedRule publicHash',
    type: String,
  })
  publicHash?: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'SpaceApprovedRule active state',
    type: 'boolean',
  })
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'SpaceApprovedRule is public state',
    type: 'boolean',
  })
  isPublic?: boolean;

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  @IsArray()
  @IsUUID('4', { each: true })
  @ApiPropertyOptional({
    description: 'SpaceApprovedRule topic ids in uuid',
  })
  topicIds?: string[];

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: `SpaceApprovedRule sort by: ${[SpaceApprovedRuleSortBy.popularity, SpaceApprovedRuleSortBy.timeAsc, SpaceApprovedRuleSortBy.timeDesc].join('|')}`,
    type: 'string',
  })
  sortBy?: SpaceApprovedRuleSortBy = SpaceApprovedRuleSortBy.timeDesc;
}
