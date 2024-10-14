import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSpaceEventImageDto {
  @IsOptional()
  @IsUUID('4')
  @ApiProperty({
    description: 'SpaceEventImage spaceId in uuid',
    nullable: true,
  })
  id?: string;

  @IsNotEmpty()
  @IsUUID('4')
  @ApiProperty({
    description: 'SpaceEventImage spaceId in uuid',
    required: true,
  })
  spaceEventId: string;

  @IsString()
  @ApiProperty({
    description: 'SpaceEventImage link',
    required: true,
  })
  link: string;
}
