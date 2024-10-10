import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateSpaceDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @ApiProperty({ description: 'Space name in string', required: true })
  name: string;

  @IsString()
  @ApiPropertyOptional({ description: 'Space zipcode' })
  zipcode: string;

  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({ description: 'Country', required: true })
  country: string;

  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({ description: 'State|Region', required: true })
  region: string;

  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({ description: 'City', required: true })
  city: string;

  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({ description: 'District', required: true })
  district: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'Address', required: true })
  address: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'Latitude in string', required: true })
  latitude: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'Longitude in string', required: true })
  longitude: string;

  @IsUUID('4')
  @ApiProperty({ description: 'Space rule ruleId in uuid' })
  ruleId: string;

  @IsString()
  @ApiProperty({ description: 'Space description' })
  details: string;
}
