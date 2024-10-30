import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class UpdateSpaceApprovedRuleDto {
  @IsNotEmpty()
  @IsUUID('4')
  @ApiProperty({
    description: 'SpaceApprovedRule spaceId in uuid',
    required: true,
  })
  spaceId: string;

  @IsNotEmpty()
  @IsUUID('4')
  @ApiProperty({
    description: 'SpaceApprovedRule ruleId in uuid',
    required: true,
  })
  ruleId: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'SpaceApprovedRule active state',
    nullable: true,
  })
  isActive?: boolean;
}
