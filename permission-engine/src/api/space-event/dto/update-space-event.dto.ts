import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

export class UpdateSpaceEventDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @ApiPropertyOptional({ description: 'SpaceEvent name', required: true })
  name?: string;

  @IsOptional()
  @IsUUID('4')
  @ApiPropertyOptional({ description: 'SpaceEvent ruleId in uuid' })
  ruleId?: string;

  @IsOptional()
  @IsUUID('4')
  @ApiPropertyOptional({
    description: 'SpaceEvent permissionRequestId in uuid',
    nullable: true,
  })
  permissionRequestId?: string;

  @IsOptional()
  @IsUUID('4')
  @ApiPropertyOptional({
    description: 'SpaceEvent externalServiceId in uuid',
    nullable: true,
  })
  externalServiceId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @ApiPropertyOptional({ description: 'SpaceEvent details' })
  details?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'SpaceEvent link for registration or purchase tickets',
  })
  link?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'SpaceEvent callbackLink for permission code submission',
  })
  callbackLink?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d+[dwMyhms]$/, {
    message: 'SpaceEvent duration must in format: {number}{d|w|M|y|h|m|s}',
  })
  @ApiPropertyOptional({
    description: 'SpaceEvent duration in {number}{d|w|M|y|h|m|s} format',
  })
  duration?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({
    description: 'SpaceEvent start timestamp',
  })
  startsAt?: Date;

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  @IsArray()
  @IsUUID('4', { each: true })
  @ApiPropertyOptional({
    description: 'SpaceEventImage uuids to remove',
  })
  removeSpaceEventImageIds?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @ApiPropertyOptional({
    description: 'SpaceEvent images in jpeg|jpg|png|gif',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    maxItems: 5,
  })
  images?: Express.Multer.File[];
}
