import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTopicDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @ApiPropertyOptional({ description: 'Topic details', nullable: true })
  details?: string;

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({
    description: 'Topic translation in json',
    nullable: true,
  })
  translation?: Record<string, any>;
}
