import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from 'src/lib/dto';

export class FindAllTopicByRuleIdDto extends PaginationDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: 'Topic ruleId in uuid',
  })
  ruleId: string;
}
