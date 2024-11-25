import {
  IsOptional,
  IsUUID,
  IsString,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from 'src/lib/dto';
import { Transform } from 'class-transformer';

export class FindAllTopicDto extends PaginationDto {
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  @IsArray()
  @IsUUID('4', { each: true })
  @ApiPropertyOptional({
    description: 'Topic ids in uuid',
  })
  ids?: string[];

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  @IsArray()
  @IsString({ each: true })
  @ApiPropertyOptional({
    description: 'Topic names',
  })
  names?: string[];

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Topic country',
  })
  country?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Topic region',
  })
  region?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Topic city',
  })
  city?: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'Topic active status',
  })
  isActive?: boolean = true;
}
