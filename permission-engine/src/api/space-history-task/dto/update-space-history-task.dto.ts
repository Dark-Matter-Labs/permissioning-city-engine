import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateSpaceHistoryTaskDto {
  @IsNotEmpty()
  @IsUUID('4')
  @ApiProperty({
    description: 'SpaceHistoryTask resolverId in uuid',
    required: true,
  })
  resolverId: string;
}
