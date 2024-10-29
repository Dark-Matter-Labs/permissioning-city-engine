import {
  IsOptional,
  IsUUID,
  IsString,
  IsArray,
  Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from 'src/lib/dto';
import { Transform } from 'class-transformer';
import { SpaceEventAccessType } from 'src/lib/type';

export class FindAllMatchedRuleDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description:
      'RuleBlock content({public|invited}:{free|paid}) with spaceEventAccess type',
  })
  spaceEventAccess?: SpaceEventAccessType;

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  @IsArray()
  @IsString({ each: true })
  @Matches(
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}:\d+$/,
    {
      each: true,
      message: 'Each item must match {spaceEquipmentId}:{number} format',
    },
  )
  @ApiPropertyOptional({
    description:
      'RuleBlock content({spaceEquipmentId}:{number}[]) with spaceEventRequireEquipment type',
  })
  spaceEventRequireEquipments?: string[];

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description:
      'RuleBlock content(number) with spaceEventExpectedAttendeeCount type',
  })
  spaceEventExpectedAttendeeCount?: number;

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  @IsArray()
  @IsUUID('4', { each: true })
  @ApiPropertyOptional({
    description:
      'RuleBlock content(spaceRuleBlockId[]) with spaceEventException type',
  })
  spaceEventExceptions?: string[];

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  @IsArray()
  @IsString({ each: true })
  @Matches(
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}:(true|false)$/,
    {
      each: true,
      message: 'Each item must match {ruleBlockId}:{boolean} format',
    },
  )
  @ApiPropertyOptional({
    description:
      'RuleBlock content({spaceRuleBlockId with spacePrePermissionCheck type}:{boolean}[])',
  })
  spacePrePremissionCheckAnswers?: string[];
}
