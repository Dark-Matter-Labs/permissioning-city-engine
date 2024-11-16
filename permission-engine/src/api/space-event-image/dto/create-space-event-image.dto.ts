import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { SpaceEventImageType } from 'src/lib/type';

export class CreateSpaceEventImageDto {
  @IsOptional()
  @IsUUID('4')
  @ApiProperty({
    description: 'SpaceEventImage id in uuid',
    nullable: true,
  })
  id?: string;

  @IsNotEmpty()
  @IsUUID('4')
  @ApiProperty({
    description: 'SpaceEventImage spaceEventId in uuid',
    required: true,
  })
  spaceEventId: string;

  @IsString()
  @ApiProperty({
    description: 'SpaceEventImage link',
    required: true,
  })
  link: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'SpaceEventImage type',
    nullable: true,
  })
  type?: SpaceEventImageType = SpaceEventImageType.list;
}
