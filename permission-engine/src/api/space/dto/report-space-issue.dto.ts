import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class ReportSpaceIssueDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'SpaceHistory details',
    required: true,
  })
  details: string;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({
    description: 'SpaceHistory is public or not',
    required: true,
  })
  isPublic: boolean;
}
