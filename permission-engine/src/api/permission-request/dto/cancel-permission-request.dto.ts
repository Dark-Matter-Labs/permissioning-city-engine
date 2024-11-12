import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CancelPermissionRequestDto {
  @IsString()
  @ApiProperty({
    description: 'PermissionRequest resolveDetails',
    required: true,
  })
  resolveDetails: string;
}
