import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsString } from 'class-validator';
import { UpdatePermissionResponseDto } from './update-permission-response.dto';

export class RejectPermissionResponseDto extends UpdatePermissionResponseDto {
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    description: 'PermissionResponse worries',
    required: true,
  })
  worries: string[];
}
