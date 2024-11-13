import {
  IsOptional,
  IsString,
  IsArray,
  Matches,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from 'src/lib/dto';
import { Transform } from 'class-transformer';

export class FindAllMatchedRuleDto extends PaginationDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: 'spaceId in uuid',
    type: String,
  })
  spaceId: string;

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  @IsArray()
  @IsString({ each: true })
  @Matches(/^[a-f0-9]{64}\^.+\^.+$/, {
    each: true,
    message: 'Each item must match {ruleBlockHash}^{desired value} format',
  })
  @ApiPropertyOptional({
    description: 'RuleBlock content({spaceRuleBlockHash}^{desired value}[])',
  })
  spaceEventExceptions?: string[];
}
