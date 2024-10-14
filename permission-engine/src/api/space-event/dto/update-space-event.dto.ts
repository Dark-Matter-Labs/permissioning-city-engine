import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class UpdateSpaceEventDto {
  @IsString()
  @MaxLength(100)
  @ApiPropertyOptional({ description: 'SpaceEvent name', required: true })
  name?: string;

  @IsUUID('4')
  @ApiPropertyOptional({ description: 'SpaceEvent ruleId in uuid' })
  ruleId?: string;

  @IsUUID('4')
  @ApiPropertyOptional({
    description: 'SpaceEvent permissionRequestId in uuid',
    nullable: true,
  })
  permissionRequestId?: string;

  @IsUUID('4')
  @ApiPropertyOptional({
    description: 'SpaceEvent externalServiceId in uuid',
    nullable: true,
  })
  externalServiceId?: string;

  @IsString()
  @MaxLength(1000)
  @ApiPropertyOptional({ description: 'SpaceEvent details' })
  details?: string;

  @IsString()
  @ApiPropertyOptional({
    description: 'SpaceEvent link for registration or purchase tickets',
  })
  link?: string;

  @IsInt()
  @ApiPropertyOptional({
    description: 'SpaceEvent duration in {number}{d|w|M|y|h|m|s} format',
  })
  duration?: string;

  @IsDateString()
  @ApiPropertyOptional({
    description: 'SpaceEvent start timestamp',
  })
  startsAt?: Date;

  @IsArray()
  @IsUUID('4', { each: true })
  @ApiPropertyOptional({
    description: 'SpaceEventImage uuids to remove',
  })
  removeSpaceEventImageIds?: string[];
}
