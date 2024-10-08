import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, MaxLength, Min } from 'class-validator';
import { UserType } from '../type';

export class UpdateUserDto {
  @IsOptional()
  @MaxLength(100)
  @ApiProperty({ description: 'User name in string' })
  name?: string;

  @IsOptional()
  @IsEmail()
  @ApiProperty({ description: 'User email' })
  email?: string;

  @IsOptional()
  @IsEnum(UserType)
  @ApiProperty({ description: 'User type', default: UserType.individual })
  type?: UserType;

  // @Matches(/^\d{4}$/, { message: 'The number must be a 4-digit number.' })
  @IsOptional()
  @Min(1900)
  @ApiProperty({ description: 'Year of birth in 4 digits' })
  birthYear?: number;

  @IsOptional()
  @MaxLength(100)
  @ApiProperty({ description: 'Country' })
  country?: string;

  @IsOptional()
  @MaxLength(100)
  @ApiProperty({ description: 'State|Region' })
  region?: string;

  @IsOptional()
  @MaxLength(100)
  @ApiProperty({ description: 'City' })
  city?: string;

  @IsOptional()
  @MaxLength(100)
  @ApiProperty({ description: 'District' })
  district?: string;
}
