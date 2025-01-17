import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class ReportSpaceIssueDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'SpaceHistory title',
    nullable: true,
  })
  title?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'SpaceHistory details',
    required: true,
  })
  details: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'SpaceHistory is public or not',
    type: 'boolean',
    required: true,
  })
  isPublic: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @ApiPropertyOptional({
    description: 'SpaceHistory image in jpeg|jpg|png|gif|heic|webp',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    maxItems: 5,
  })
  images?: Express.Multer.File[];
}
