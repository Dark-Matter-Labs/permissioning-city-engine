import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
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
  @IsBoolean()
  @ApiProperty({
    description: 'SpaceHistory is public or not',
    required: true,
  })
  isPublic: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(1)
  @ApiPropertyOptional({
    description: 'SpaceHistory image in jpeg|jpg|png|gif|heic|webp',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    maxItems: 1,
  })
  image?: Express.Multer.File[];
}
