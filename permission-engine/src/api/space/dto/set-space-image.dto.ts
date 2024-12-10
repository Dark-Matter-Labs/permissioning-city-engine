import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsNotEmpty } from 'class-validator';

export class SetSpaceImageDto {
  @IsNotEmpty()
  @IsArray()
  @ArrayMaxSize(5)
  @ApiProperty({
    description: 'Space images in jpeg|jpg|png|gif|heic|webp',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    maxItems: 1,
  })
  images?: Express.Multer.File[];
}
