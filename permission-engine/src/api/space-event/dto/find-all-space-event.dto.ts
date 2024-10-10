import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SpaceEventStatus } from 'src/lib/type';
import { PaginationDto } from 'src/lib/dto';

export class FindAllSpaceEventDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({
    description: 'SpaceEvent organizer userId in uuid',
    type: String,
  })
  organizerId?: string;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({
    description: 'SpaceEvent spaceId in uuid',
    type: String,
  })
  spaceId?: string;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({
    description: 'SpaceEvent externalServiceId in uuid',
    type: String,
  })
  externalServiceId?: string;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({
    description: 'SpaceEvent permissionRequestId in uuid',
    type: String,
  })
  permissionRequestId?: string;

  @IsOptional()
  @IsString({ each: true })
  @ApiPropertyOptional({
    description: 'SpaceEvent statuses',
    type: String,
    isArray: true,
  })
  statuses?: SpaceEventStatus[];

  @IsOptional()
  @IsUUID('4', { each: true })
  @ApiPropertyOptional({
    description: 'SpaceEvent topicIds in uuid',
    type: String,
    isArray: true,
  })
  topicIds?: string[];

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'SpaceEvent startsAfter date',
    type: Date,
  })
  startsAfter?: Date;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'SpaceEvent name',
    type: String,
  })
  name?: string;
}
