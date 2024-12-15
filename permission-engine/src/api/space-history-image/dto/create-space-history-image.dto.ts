import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSpaceHistoryImageDto {
  @IsOptional()
  @IsUUID('4')
  @ApiProperty({
    description: 'SpaceHistoryImage id in uuid',
    nullable: true,
  })
  id?: string;

  @IsNotEmpty()
  @IsUUID('4')
  @ApiProperty({
    description: 'SpaceHistoryImage spaceHistoryId in uuid',
    required: true,
  })
  spaceHistoryId: string;

  @IsString()
  @ApiProperty({
    description: 'SpaceHistoryImage link',
    required: true,
  })
  link: string;
}
