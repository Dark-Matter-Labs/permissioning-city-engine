import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class VolunteerSpaceIssueResolveDto {
  @IsNotEmpty()
  @IsUUID('4')
  @ApiProperty({
    description: 'Id of the issue reported SpaceHistory in uuid',
    required: true,
  })
  spaceHistoryId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'SpaceHistory details',
    required: true,
  })
  details: string;
}
