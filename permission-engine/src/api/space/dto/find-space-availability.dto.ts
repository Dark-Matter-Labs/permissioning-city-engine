import { IsNotEmpty, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FindSpaceAvailabilityDto {
  @IsNotEmpty()
  @IsDateString()
  @ApiPropertyOptional({
    description: 'Space availability query range start date',
  })
  startDate?: string = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  ).toISOString();

  @IsNotEmpty()
  @IsDateString()
  @ApiPropertyOptional({
    description: 'Space availability query range end date',
  })
  endDate?: string = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0,
  ).toISOString();
}
