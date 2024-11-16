import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsString, IsOptional } from 'class-validator';

export class ResolveSpaceIssueDto {
  @IsNotEmpty()
  @IsUUID('4')
  @ApiProperty({
    description: 'Id of the issue reported SpaceHistory in uuid',
    required: true,
  })
  spaceHistoryId: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'SpaceHistory details',
    nullable: true,
  })
  details?: string;
}
