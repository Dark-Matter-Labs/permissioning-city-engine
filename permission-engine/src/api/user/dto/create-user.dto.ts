import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({ description: 'User name in string', required: true })
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: 'User email', required: true })
  email: string;

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
  @MaxLength(200)
  @ApiPropertyOptional({ description: 'Details' })
  details?: string;

  @IsOptional()
  @ApiPropertyOptional({ description: 'Profile Image' })
  image?: string;
}
