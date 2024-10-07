import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreatePermissionRequestDto {
  @IsUUID('4')
  @ApiProperty({
    description: 'PermissionRequest spaceId in uuid',
    required: true,
  })
  spaceId: string;

  @IsUUID('4')
  @ApiProperty({
    description: 'PermissionRequest spaceEventId in uuid',
    nullable: true,
  })
  spaceEventId: string;

  @IsUUID('4')
  @ApiProperty({
    description: 'PermissionRequest spaceRuleId in uuid',
    nullable: true,
  })
  spaceRuleId?: string;

  @IsUUID('4')
  @ApiProperty({
    description: 'PermissionRequest spaceEventRuleId in uuid',
    nullable: true,
  })
  spaceEventRuleId?: string;
}
