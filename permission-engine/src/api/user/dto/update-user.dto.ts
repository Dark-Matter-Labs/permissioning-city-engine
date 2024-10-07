import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsUUID,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { UserType } from '../type';

export class UpdateUserDto {
  @IsUUID()
  @ApiProperty({ description: 'User id in uuid', required: true })
  id: string;

  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({ description: 'User name in string' })
  name?: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: 'User email' })
  email?: string;

  @IsEnum(UserType)
  @ApiProperty({ description: 'User type', default: 'individual' })
  type?: 'individual' | 'organization' | 'government';

  @Matches(/^\d{4}$/, { message: 'The number must be a 4-digit number.' })
  @Min(1900)
  @IsNotEmpty()
  @ApiProperty({ description: 'Year of birth in 4 digits' })
  birthYear?: number;

  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({ description: 'Country' })
  country?: string;

  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({ description: 'State|Region' })
  region?: string;

  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({ description: 'City' })
  city?: string;

  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({ description: 'District' })
  district?: string;
}
