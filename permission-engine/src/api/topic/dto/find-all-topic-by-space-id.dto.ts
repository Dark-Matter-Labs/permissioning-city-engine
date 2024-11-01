import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from 'src/lib/dto';

export class FindAllTopicBySpaceIdDto extends PaginationDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: 'Topic spaceId in uuid',
  })
  spaceId: string;
}
