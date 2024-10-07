import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ForkRuleDto {
  @IsUUID('4')
  @ApiProperty({ description: 'Rule id', required: true })
  id: string;

  @IsUUID('4')
  @ApiProperty({ description: 'Rule authorId in uuid', required: true })
  authorId: string;
}
