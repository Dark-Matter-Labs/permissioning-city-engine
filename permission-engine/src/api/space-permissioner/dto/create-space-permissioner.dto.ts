import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateSpacePermissionerDto {
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

  @IsOptional()
  @IsUUID()
  @ApiProperty({
    description: 'SpacePermissioner inviterId in uuid',
    nullable: true,
  })
  inviterId?: string;
}
