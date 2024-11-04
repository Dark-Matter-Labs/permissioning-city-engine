import { IsOptional, IsUUID, IsString, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from 'src/lib/dto';

export class FindAllTopicDto extends PaginationDto {
  @IsOptional()
  @IsUUID('4', { each: true })
  @ApiPropertyOptional({
    description: 'Topic ids in uuid',
  })
  ids?: string[];

  @IsOptional()
  @IsString()
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
