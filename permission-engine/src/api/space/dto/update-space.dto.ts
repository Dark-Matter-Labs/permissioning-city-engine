import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class UpdateSpaceDto {
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

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Space external link' })
  link?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Space timezone' })
  timezone?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @ApiPropertyOptional({
    description: 'Space images in jpeg|jpg|png|gif',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    maxItems: 5,
  })
  images?: Express.Multer.File[];
}
