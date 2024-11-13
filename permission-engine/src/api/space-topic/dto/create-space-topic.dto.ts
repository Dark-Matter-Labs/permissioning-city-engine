import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateSpaceTopicDto {
  @IsNotEmpty()
  @IsUUID('4')
  @ApiProperty({
    description: 'SpaceTopic spaceId in uuid',
    required: true,
  })
  spaceId: string;

  @IsNotEmpty()
  @IsUUID('4')
  @ApiProperty({
    description: 'SpaceTopic topicId in uuid',
    required: true,
  })
  topicId: string;
}
