import { IsOptional, IsUUID, IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from 'src/lib/dto';

export class FindAllIssueSpaceHistoryDto extends PaginationDto {
  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'SpaceHistory is public',
    type: 'boolean',
  })
  isPublic?: boolean;

  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: 'SpaceHistory spaceId in uuid',
    type: String,
  })
  spaceId: string;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({
    description: 'SpaceHistory spaceEventId in uuid',
    type: String,
  })
  spaceEventId?: string;
}
