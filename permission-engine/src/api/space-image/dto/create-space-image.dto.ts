import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { SpaceImageType } from 'src/lib/type';

export class CreateSpaceImageDto {
  @IsOptional()
  @IsUUID('4')
  @ApiProperty({
    description: 'SpaceImage id in uuid',
    nullable: true,
  })
  id?: string;

  @IsNotEmpty()
  @IsUUID('4')
  @ApiProperty({
    description: 'SpaceImage spaceId in uuid',
    required: true,
  })
  spaceId: string;

  @IsString()
  @ApiProperty({
    description: 'SpaceImage link',
    required: true,
  })
  link: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'SpaceImage type',
    nullable: true,
  })
  type?: SpaceImageType = SpaceImageType.list;
}
