import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from 'src/lib/dto';
import { Transform } from 'class-transformer';

export class FindAllSpaceDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({
    description: 'Space owner userId in uuid',
    type: String,
  })
  ownerId?: string;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({
    description: 'Space ruleId in uuid',
    type: String,
  })
  ruleId?: string;

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  @IsArray()
  @IsUUID('4', { each: true })
  @ApiPropertyOptional({
    description: 'Space topicIds in uuid',
  })
  topicIds?: string[];

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Space name',
    type: String,
  })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Space timezone',
    type: String,
  })
  timezone?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Space country',
    type: String,
  })
  country?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Space region',
    type: String,
  })
  region?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Space city',
    type: String,
  })
  city?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Space district',
    type: String,
  })
  district?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Space address',
    type: String,
  })
  address?: string;
}
