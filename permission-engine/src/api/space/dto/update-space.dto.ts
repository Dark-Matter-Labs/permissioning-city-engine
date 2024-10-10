import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class UpdateSpaceDto {
  @IsUUID()
  @ApiProperty({ description: 'Space id in uuid' })
  id: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @ApiProperty({ description: 'Space name in string', required: true })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Space zipcode' })
  zipcode?: string;

  @IsOptional()
  @MaxLength(100)
  @ApiProperty({ description: 'Country', required: true })
  country?: string;

  @IsOptional()
  @MaxLength(100)
  @ApiProperty({ description: 'State|Region', required: true })
  region?: string;

  @IsOptional()
  @MaxLength(100)
  @ApiProperty({ description: 'City', required: true })
  city?: string;

  @IsOptional()
  @MaxLength(100)
  @ApiProperty({ description: 'District', required: true })
  district?: string;

  @IsOptional()
  @ApiProperty({ description: 'Address', required: true })
  address?: string;

  @IsOptional()
  @ApiProperty({ description: 'Latitude in string', required: true })
  latitude?: string;

  @IsOptional()
  @ApiProperty({ description: 'Longitude in string', required: true })
  longitude?: string;

  @IsOptional()
  @IsUUID('4')
  @ApiProperty({ description: 'Space rule ruleId in uuid' })
  ruleId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Space description' })
  details?: string;
}
