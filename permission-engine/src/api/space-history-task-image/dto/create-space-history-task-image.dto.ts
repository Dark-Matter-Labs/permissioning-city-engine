import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSpaceHistoryTaskImageDto {
  @IsOptional()
  @IsUUID('4')
  @ApiProperty({
    description: 'SpaceHistoryTaskImage id in uuid',
    nullable: true,
  })
  id?: string;

  @IsNotEmpty()
  @IsUUID('4')
  @ApiProperty({
    description: 'SpaceHistoryTaskImage spaceHistoryTaskId in uuid',
    required: true,
  })
  spaceHistoryTaskId: string;

  @IsString()
  @ApiProperty({
    description: 'SpaceHistoryTaskImage link',
    required: true,
  })
  link: string;
}
