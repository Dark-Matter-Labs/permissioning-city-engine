import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  UserNotificationTarget,
  UserNotificationType,
  UserNotificationTemplateName,
} from 'src/lib/type';

export class CreateUserNotificationDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: 'UserNotification userId in uuid',
    required: true,
  })
  userId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'UserNotification target',
    required: true,
  })
  target: UserNotificationTarget;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'UserNotification userId in uuid',
    required: true,
  })
  type: UserNotificationType;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'UserNotification userId in uuid',
    required: true,
  })
  externalServiceId?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'UserNotification userId in uuid',
    required: true,
  })
  link?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'UserNotification userId in uuid',
    required: true,
  })
  templateName: UserNotificationTemplateName;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'UserNotification userId in uuid',
    required: true,
  })
  subjectPart?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'UserNotification userId in uuid',
    required: true,
  })
  textPart?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'UserNotification userId in uuid',
    required: true,
  })
  htmlPart?: string;

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({
    description: 'UserNotification userId in uuid',
    nullable: true,
  })
  params?: Record<string, any>;
}
