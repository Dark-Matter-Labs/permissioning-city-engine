import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateSpaceHistoryTaskDto {
  @IsNotEmpty()
  @IsUUID('4')
  @ApiProperty({
    description: 'SpaceHistoryTask spaceId in uuid',
    required: true,
  })
  spaceId: string;

  @IsNotEmpty()
  @IsUUID('4')
  @ApiProperty({
    description: 'SpaceHistoryTask spaceHistoryId in uuid',
    required: true,
  })
  spaceHistoryId: string;

  @IsNotEmpty()
  @IsUUID('4')
  @ApiProperty({
    description: 'SpaceHistoryTask creatorId in uuid',
    required: true,
  })
  creatorId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'SpaceHistory title',
    required: true,
  })
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'SpaceHistory details',
    required: true,
  })
  details: string;
}
