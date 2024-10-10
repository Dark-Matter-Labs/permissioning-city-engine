import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class JoinSpacePermissionerDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: 'SpacePermissioner spaceId in uuid',
    required: true,
  })
  spaceId: string;
}
