import { IsOptional, IsUUID, IsString, IsArray } from 'class-validator';
import { ApiHideProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PermissionResponseStatus } from 'src/lib/type';
import { PaginationDto } from 'src/lib/dto';
import { Transform } from 'class-transformer';

export class FindAllPermissionResponseDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({
    description: 'PermissionResponse permissionRequestId in uuid',
    type: String,
  })
  permissionRequestId?: string;

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  @IsArray()
  @IsUUID('4', { each: true })
  @ApiHideProperty()
  spacePermissionerIds?: string[];

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  @IsArray()
  @IsString({ each: true })
  @ApiPropertyOptional({
    description: 'PermissionResponse statuses',
  })
  statuses?: PermissionResponseStatus[];
}
