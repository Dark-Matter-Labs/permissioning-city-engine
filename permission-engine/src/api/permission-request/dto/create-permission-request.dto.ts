import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

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
  spaceEventId?: string;

  @IsOptional()
  @IsUUID('4')
  @ApiProperty({
    description: 'Desired spaceRuleId to replace the current spaceRuleId',
    nullable: true,
  })
  spaceRuleId?: string;
}
