import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { UserType } from '../type';

export class UpdateUserDto {
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({ description: 'User name in string', required: true })
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: 'User email', required: true })
  email: string;

  @IsEnum(UserType)
  @ApiProperty({ description: 'User type', default: 'individual' })
  type: 'individual' | 'organization' | 'government';

  @Matches(/^\d{4}$/, { message: 'The number must be a 4-digit number.' })
  @Min(1900)
  @IsNotEmpty()
  @ApiProperty({ description: 'Year of birth in 4 digits', required: true })
  birthYear: number;

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
}
