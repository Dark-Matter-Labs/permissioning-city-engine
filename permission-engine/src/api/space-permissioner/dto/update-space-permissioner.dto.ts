import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateSpacePermissionerDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({ description: 'SpacePermissioner id in uuid', required: true })
  id: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    description: 'SpacePermissioner isActive status in boolean',
    required: true,
  })
  isActive: boolean;
}
