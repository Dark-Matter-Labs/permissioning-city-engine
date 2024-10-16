import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsString, MaxLength, Min } from 'class-validator';

export class UpdateSpaceEquipmentDto {
  @IsString()
  @MaxLength(100)
  @ApiPropertyOptional({
    description: 'SpaceEquipment name',
    nullable: true,
  })
  name?: string;

  @IsInt()
  @Min(1)
  @ApiPropertyOptional({
    description: 'SpaceEquipment quantity',
    nullable: true,
  })
  quantity?: number;

  @IsString()
  @MaxLength(1000)
  @ApiPropertyOptional({
    description: 'SpaceEquipment details',
    nullable: true,
  })
  details?: string;

  @IsBoolean()
  @ApiPropertyOptional({
    description: 'SpaceEquipment active state',
    nullable: true,
  })
  isActive?: boolean;
}