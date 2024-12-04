import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReportSpaceIssueDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'SpaceHistory title',
    nullable: true,
  })
  title?: string;

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
