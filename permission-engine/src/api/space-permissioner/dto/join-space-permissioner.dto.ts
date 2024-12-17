import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class JoinSpacePermissionerDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'SpacePermissioner join message',
    nullable: true,
  })
  message: string;
}
