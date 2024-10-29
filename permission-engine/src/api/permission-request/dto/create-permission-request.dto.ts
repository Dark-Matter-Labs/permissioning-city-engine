import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class CreatePermissionRequestDto {
  @IsUUID('4')
  @ApiProperty({
    description: 'PermissionRequest spaceId in uuid',
    required: true,
  })
  spaceId: string;

  @IsUUID('4')
  @ApiPropertyOptional({
    description: 'PermissionRequest spaceEventId in uuid',
    nullable: true,
  })
  spaceEventId?: string;

  @IsOptional()
  @IsUUID('4')
  @ApiPropertyOptional({
    description:
      'Desired spaceRuleId to replace the current spaceRuleId (Only allowed to SpacePermissioners)',
    nullable: true,
  })
  spaceRuleId?: string;

  @IsOptional()
  @IsUUID('4')
  @ApiPropertyOptional({
    description:
      'Desired spaceEventRuleId to pre approve (Only allowed to SpacePermissioners)',
    nullable: true,
  })
  spaceEventRuleId?: string;
}
