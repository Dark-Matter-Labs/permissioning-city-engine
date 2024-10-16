import { IsOptional, IsUUID, IsString, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PermissionRequestStatus } from 'src/lib/type';
import { PaginationDto } from 'src/lib/dto';
import { Transform } from 'class-transformer';

export class FindAllPermissionRequestDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({
    description: 'PermissionRequest spaceId in uuid',
    type: String,
  })
  spaceId?: string;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({
    description: 'PermissionRequest spaceEventId in uuid',
    type: String,
  })
  spaceEventId?: string;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({
    description: 'PermissionRequest ruleId in uuid',
    type: String,
  })
  ruleId?: string;

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  @IsArray()
  @IsString({ each: true })
  @ApiPropertyOptional({
    description: 'PermissionRequest statuses',
  })
  statuses?: PermissionRequestStatus[];
}
