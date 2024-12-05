import { IsOptional, IsUUID, IsBoolean, IsNotEmpty } from 'class-validator';
import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { PaginationDto } from 'src/lib/dto';

export class FindAllIssueSpaceHistoryDto extends PaginationDto {
  @IsOptional()
  @IsBoolean()
  @ApiHideProperty()
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
