import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateSpaceApprovedRuleDto {
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
  @IsUUID('4')
  @ApiPropertyOptional({
    description: 'SpaceApprovedRule permissionRequestId in uuid',
    nullable: true,
  })
  permissionRequestId?: string;
}
