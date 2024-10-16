import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CompleteSpaceEventDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @ApiPropertyOptional({ description: 'SpaceEvent post event details' })
  details?: string;

  @IsArray()
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  @IsUUID('4', { each: true })
  @ArrayNotEmpty()
  @ApiProperty({
    description: 'Complete SpaceEventRuleBlock uuids',
  })
  completePostEventCheckRuleBlockIds: string[];

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  @IsArray()
  @IsUUID('4', { each: true })
  @ApiPropertyOptional({
    description: 'Incomplete SpaceEventRuleBlock uuids',
  })
  incompletePostEventCheckRuleBlockIds?: string[];

  @IsArray()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'SpaceEvent complete images in jpeg|jpg|png|gif',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  images?: Express.Multer.File[];
}
