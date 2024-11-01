import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTopicDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @ApiProperty({ description: 'Topic name', required: true })
  name: string;

  @IsOptional()
  @MaxLength(100)
  @ApiPropertyOptional({ description: 'Country', nullable: true })
  country?: string = 'common';

  @IsOptional()
  @MaxLength(100)
  @ApiPropertyOptional({ description: 'State|Region', nullable: true })
  region?: string = 'common';

  @IsOptional()
  @MaxLength(100)
  @ApiPropertyOptional({ description: 'City', nullable: true })
  city?: string = 'common';

  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  @ApiProperty({ description: 'Topic details', required: true })
  details: string;
}
