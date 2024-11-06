import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from 'src/lib/dto';
import { SpaceApprovedRuleSortBy } from 'src/lib/type';

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
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'SpaceApprovedRule active state',
    type: 'boolean',
  })
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: `SpaceApprovedRule sort by: ${[SpaceApprovedRuleSortBy.popularity, SpaceApprovedRuleSortBy.timeAsc, SpaceApprovedRuleSortBy.timeDesc].join('|')}`,
    type: 'string',
  })
  sortBy?: SpaceApprovedRuleSortBy = SpaceApprovedRuleSortBy.timeDesc;
}
