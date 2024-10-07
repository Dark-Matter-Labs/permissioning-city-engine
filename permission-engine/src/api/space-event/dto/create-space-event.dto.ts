import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsUUID,
  IsInt,
  IsDate,
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

  @IsUUID('4')
  @ApiProperty({ description: 'SpaceEvent spaceId in uuid', nullable: true })
  spaceId?: string;

  @IsUUID('4')
  @ApiProperty({
    description: 'SpaceEvent permissionRequestId in uuid',
    nullable: true,
  })
  permissionRequestId?: string;

  @IsUUID('4')
  @ApiProperty({
    description: 'SpaceEvent externalServiceId in uuid',
    nullable: true,
  })
  externalServiceId?: string;

  @IsString()
  @ApiProperty({ description: 'SpaceEvent details', nullable: true })
  details?: string;

  @IsString()
  @ApiProperty({
    description: 'SpaceEvent link for registration or purchase tickets',
    nullable: true,
  })
  link?: string;

  @IsInt()
  @ApiProperty({
    description: 'SpaceEvent duration in {number}{d|w|M|y|h|m|s} format',
  })
  duration: string;

  @IsDate()
  @ApiProperty({
    description: 'SpaceEvent start date',
  })
  startsAt: Date;
}
