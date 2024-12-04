import { IsNotEmpty, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FindSpaceAvailabilityDto {
  @IsNotEmpty()
  @IsDateString()
  @ApiPropertyOptional({
    description: 'Space availability query range start date',
  })
  startDate?: string;

  @IsNotEmpty()
  @IsDateString()
  @ApiPropertyOptional({
    description: 'Space availability query range end date',
  })
  endDate?: string;
}
