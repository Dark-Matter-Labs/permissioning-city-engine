import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

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
}
