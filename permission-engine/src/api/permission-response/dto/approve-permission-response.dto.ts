import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { UpdatePermissionResponseDto } from './update-permission-response.dto';

export class ApprovePermissionResponseDto extends UpdatePermissionResponseDto {
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  @IsArray()
  @IsString({ each: true })
  @ApiPropertyOptional({
    description: 'PermissionResponse conditions',
    nullable: true,
  })
  conditions?: string[];
}
