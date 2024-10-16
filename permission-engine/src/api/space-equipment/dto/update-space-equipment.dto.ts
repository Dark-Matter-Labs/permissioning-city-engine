import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateSpaceEquipmentDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @ApiPropertyOptional({
    description: 'SpaceEquipment name',
    nullable: true,
  })
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({
    description: 'SpaceEquipment quantity',
    nullable: true,
  })
  quantity?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @ApiPropertyOptional({
    description: 'SpaceEquipment details',
    nullable: true,
  })
  details?: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'SpaceEquipment active state',
    nullable: true,
  })
  isActive?: boolean;
}
