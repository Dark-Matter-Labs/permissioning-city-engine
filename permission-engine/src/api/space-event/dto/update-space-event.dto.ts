import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsInt, IsString, IsUUID, MaxLength } from 'class-validator';

export class UpdateSpaceEventDto {
  @IsString()
  @MaxLength(100)
  @ApiProperty({ description: 'SpaceEvent name', required: true })
  name?: string;

  @IsUUID()
  @ApiProperty({
    description: 'SpaceEvent permissionRequestId in uuid',
    nullable: true,
  })
  permissionRequestId?: string;

  @IsUUID()
  @ApiProperty({
    description: 'SpaceEvent externalServiceId in uuid',
    nullable: true,
  })
  externalServiceId?: string;

  @IsString()
  @MaxLength(1000)
  @ApiProperty({ description: 'SpaceEvent details' })
  details?: string;

  @IsString()
  @ApiProperty({
    description: 'SpaceEvent link for registration or purchase tickets',
  })
  link?: string;

  @IsInt()
  @ApiProperty({
    description: 'SpaceEvent duration in {number}{d|w|M|y|h|m|s} format',
  })
  duration?: string;

  @IsDate()
  @ApiProperty({
    description: 'SpaceEvent start timestamp',
  })
  startsAt?: Date;
}
