import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class InviteSpacePermissionerDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: 'SpacePermissioner spaceId in uuid',
    required: true,
  })
  spaceId: string;

  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: 'SpacePermissioner userId in uuid',
    required: true,
  })
  userId: string;
}
