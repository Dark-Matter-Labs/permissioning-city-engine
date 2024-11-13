import { IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from 'src/lib/dto';

export class FindAllSpaceFacilityDto extends PaginationDto {
  @IsUUID()
  @ApiProperty({
    description: 'SpaceFacility spaceId in uuid',
    type: String,
  })
  spaceId: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'SpaceFacility active state',
    type: 'boolean',
  })
  isActive?: boolean;
}
