import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { CompleteSpaceEventDto } from './complete-space-event.dto';

export class CompleteWithIssueSpaceEventDto extends CompleteSpaceEventDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @ApiPropertyOptional({ description: 'SpaceEvent post event details' })
  details: string;
}
