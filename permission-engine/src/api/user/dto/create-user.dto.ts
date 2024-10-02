import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({ description: 'User name in string', required: true })
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: 'User email', required: true })
  email: string;
}
