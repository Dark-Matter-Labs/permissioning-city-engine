import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsUUID,
  IsOptional,
  Matches,
  IsDateString,
  IsArray,
  ArrayMaxSize,
} from 'class-validator';

export class CreateSpaceEventDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @ApiProperty({ description: 'SpaceEvent name', required: true })
  name: string;

  @IsUUID('4')
  @ApiProperty({
    description: 'SpaceEvent organizerId in uuid',
    required: true,
  })
  organizerId: string;

  @IsOptional()
  @IsUUID('4')
  @ApiPropertyOptional({
    description: 'SpaceEvent spaceId in uuid',
    nullable: true,
  })
  spaceId?: string;

  @IsOptional()
  @IsUUID('4')
  @ApiPropertyOptional({
    description: 'SpaceEvent ruleId in uuid',
    nullable: true,
  })
  ruleId?: string;

  @IsOptional()
  @IsUUID('4')
  @ApiPropertyOptional({
    description: 'SpaceEvent externalServiceId in uuid',
    nullable: true,
  })
  externalServiceId?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'SpaceEvent details', nullable: true })
  details?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'SpaceEvent link for registration or purchase tickets',
    nullable: true,
  })
  link?: string;

  @IsString()
  @Matches(/^\d+[dwMyhms]$/, {
    message: 'SpaceEvent duration must in format: {number}{d|w|M|y|h|m|s}',
  })
  @ApiProperty({
    description: 'SpaceEvent duration in {number}{d|w|M|y|h|m|s} format',
  })
  duration: string;

  @IsDateString()
  @ApiProperty({
    description: 'SpaceEvent start date',
  })
  startsAt: Date;

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
