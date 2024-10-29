import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateSpaceEventRulePreApprovePermissionRequestDto {
  @IsNotEmpty()
  @IsUUID('4')
  @ApiProperty({
    description: 'PermissionRequest spaceId in uuid',
    required: true,
  })
  spaceId: string;

  @IsNotEmpty()
  @IsUUID('4')
  @ApiProperty({
    description: 'PermissionRequest spaceEventRuleId in uuid',
    required: true,
  })
  spaceEventRuleId: string;
}
