import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

export enum RuleType {
  space = 'space',
  spaceEvent = 'space_event',
}

export class CreateRuleDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @ApiProperty({ description: 'Space name in string', required: true })
  name: string;

  @IsInt()
  @ApiProperty({ description: 'Space zipcode' })
  zipcode: number;

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

  @IsUUID()
  @ApiProperty({ description: 'Space rule ruleId in uuid' })
  ruleId: string;

  @IsString()
  @Matches(/^(under|over|is)_[0-9]+_(yes|no)$/, {
    message:
      'consent conditions must in format: {under|over|is}_{percent}_{yes|no}',
  })
  @ApiProperty({
    description: 'Space consent condition: {under|over|is}_{percent}_{yes|no}',
  })
  consentCondition: string;

  @IsString()
  @ApiProperty({ description: 'Space description' })
  details: string;
}
