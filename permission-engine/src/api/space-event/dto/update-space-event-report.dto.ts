import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';
import { SpaceEventReportQuestion } from 'src/lib/type';

export class UpdateSpaceEventReportDto {
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @ApiProperty({
    description: 'SpaceEvent report attendee count',
  })
  attendeeCount: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(10)
  @ApiProperty({
    description: SpaceEventReportQuestion.spaceSuitability,
  })
  spaceSuitability: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(10)
  @ApiProperty({
    description: SpaceEventReportQuestion.spaceSatisfaction,
  })
  spaceSatisfaction: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: SpaceEventReportQuestion.eventGoal,
  })
  eventGoal: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: SpaceEventReportQuestion.spaceIssue,
  })
  spaceIssue: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: SpaceEventReportQuestion.spaceSuggestions,
  })
  spaceSuggestions: string;
}
