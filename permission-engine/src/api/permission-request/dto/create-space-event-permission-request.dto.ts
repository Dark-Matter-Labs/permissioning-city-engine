import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateSpaceEventPermissionRequestDto {
  @IsNotEmpty()
  @IsUUID('4')
  @ApiProperty({
    description: 'PermissionRequest spaceEventId in uuid',
    required: true,
  })
  spaceEventId: string;
}
