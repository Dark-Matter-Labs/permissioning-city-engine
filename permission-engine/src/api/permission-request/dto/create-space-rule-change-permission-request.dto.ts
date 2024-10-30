import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateSpaceRuleChangePermissionRequestDto {
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
    description: 'PermissionRequest spaceRuleId in uuid',
    required: true,
  })
  spaceRuleId: string;
}
