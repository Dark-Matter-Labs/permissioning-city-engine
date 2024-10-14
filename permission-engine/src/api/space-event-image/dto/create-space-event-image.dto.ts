import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateSpaceEventImageDto {
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
