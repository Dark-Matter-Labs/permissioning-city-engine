import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class MarkIssueResolveVolunteerFullDto {
  @IsNotEmpty()
  @IsUUID('4')
  @ApiProperty({
    description: 'Id of the issue reported SpaceHistory in uuid',
    required: true,
  })
  spaceHistoryId: string;
}
