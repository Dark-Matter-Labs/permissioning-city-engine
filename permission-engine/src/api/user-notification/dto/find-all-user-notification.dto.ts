import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserNotificationStatus } from 'src/lib/type';
import { PaginationDto } from 'src/lib/dto';

export class FindAllUserNotificationDto extends PaginationDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: 'UserNotification userId in uuid',
    type: String,
  })
  userId: string;

  @IsOptional()
  @IsString({ each: true })
  @ApiPropertyOptional({
    description: 'UserNotification statuses',
    type: String,
    isArray: true,
  })
  statuses?: UserNotificationStatus[];
}
