import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsString, IsUUID, MaxLength } from 'class-validator';

export class CompleteSpaceEventDto {
  @IsString()
  @MaxLength(1000)
  @ApiPropertyOptional({ description: 'SpaceEvent post event details' })
  details?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @ApiPropertyOptional({
    description: 'Complete SpaceEventRuleBlock uuids',
  })
  completePostEventCheckRuleBlockIds: string[];

  @IsArray()
  @IsUUID('4', { each: true })
  @ApiPropertyOptional({
    description: 'Incomplete SpaceEventRuleBlock uuids',
  })
  incompletePostEventCheckRuleBlockIds?: string[];
}
