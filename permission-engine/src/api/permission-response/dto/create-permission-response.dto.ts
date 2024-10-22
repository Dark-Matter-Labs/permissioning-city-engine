import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsUUID } from 'class-validator';

export class CreatePermissionResponseDto {
  @IsUUID('4')
  @ApiProperty({
    description: 'PermissionResponse permissionRequestId in uuid',
    required: true,
  })
  permissionRequestId: string;

  @IsUUID('4')
  @ApiProperty({
    description: 'PermissionResponse spacePermissionerId in uuid',
    required: true,
  })
  spacePermissionerId: string;

  @IsDateString()
  @ApiPropertyOptional({
    description: 'PermissionResponse timeout date',
    nullable: true,
  })
  timeoutAt?: Date;
}
