import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class UpdateSpaceDto {
  @IsUUID()
  @ApiProperty({ description: 'Space id in uuid' })
  id: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @ApiPropertyOptional({ description: 'Space name in string' })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Space zipcode' })
  zipcode?: string;

  @IsOptional()
  @MaxLength(100)
  @ApiPropertyOptional({ description: 'Country' })
  country?: string;

  @IsOptional()
  @MaxLength(100)
  @ApiPropertyOptional({ description: 'State|Region' })
  region?: string;

  @IsOptional()
  @MaxLength(100)
  @ApiPropertyOptional({ description: 'City' })
  city?: string;

  @IsOptional()
  @MaxLength(100)
  @ApiPropertyOptional({ description: 'District' })
  district?: string;

  @IsOptional()
  @ApiPropertyOptional({ description: 'Address' })
  address?: string;

  @IsOptional()
  @ApiPropertyOptional({ description: 'Latitude in string' })
  latitude?: string;

  @IsOptional()
  @ApiPropertyOptional({ description: 'Longitude in string' })
  longitude?: string;

  @IsOptional()
  @IsUUID('4')
  @ApiPropertyOptional({ description: 'Space rule ruleId in uuid' })
  ruleId?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Space description' })
  details?: string;
}
