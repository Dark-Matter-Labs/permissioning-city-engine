import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class AddSpaceHistoryTaskDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'SpaceHistoryTask title',
    nullable: true,
  })
  title?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'SpaceHistoryTask details',
    required: true,
  })
  details: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @ApiPropertyOptional({
    description: 'SpaceHistoryTask image in jpeg|jpg|png|gif|heic|webp',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    maxItems: 5,
  })
  images?: Express.Multer.File[];
}
