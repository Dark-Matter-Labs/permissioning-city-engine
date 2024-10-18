import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, MaxLength, Min } from 'class-validator';
import { UserType } from 'src/lib/type';

export class UpdateUserDto {
  @IsOptional()
  @MaxLength(100)
  @ApiPropertyOptional({ description: 'User name in string' })
  name?: string;

  @IsOptional()
  @IsEmail()
  @ApiPropertyOptional({ description: 'User email' })
  email?: string;

  @IsOptional()
  @IsEnum(UserType)
  @ApiPropertyOptional({
    description: 'User type',
    default: UserType.individual,
  })
  type?: UserType;

  // @Matches(/^\d{4}$/, { message: 'The number must be a 4-digit number.' })
  @IsOptional()
  @Min(1900)
  @ApiPropertyOptional({ description: 'Year of birth in 4 digits' })
  birthYear?: number;

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
}
