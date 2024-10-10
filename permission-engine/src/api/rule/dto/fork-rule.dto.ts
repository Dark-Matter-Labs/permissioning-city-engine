import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class ForkRuleDto {
  @IsNotEmpty()
  @IsUUID('4')
  @ApiProperty({ description: 'Rule id', required: true })
  id: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @ApiProperty({ description: 'Rule name', required: true })
  name?: string;
}
