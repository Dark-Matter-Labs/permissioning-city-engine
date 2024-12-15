import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { SpaceHistoryType } from 'src/lib/type';

export class CreateSpaceHistoryDto {
  @IsNotEmpty()
  @IsUUID('4')
  @ApiProperty({
    description: 'SpaceHistory spaceId in uuid',
    required: true,
  })
  spaceId: string;

  @IsNotEmpty()
  @IsUUID('4')
  @ApiProperty({
    description: 'Space ruleId in uuid',
    required: true,
  })
  ruleId: string;

  @IsOptional()
  @IsUUID('4')
  @ApiPropertyOptional({
    description: 'SpaceHistory loggerId in uuid',
    nullable: true,
  })
  loggerId?: string;

  @IsOptional()
  @IsUUID('4')
  @ApiPropertyOptional({
    description: 'SpaceHistory parent spaceHistoryId in uuid',
    nullable: true,
  })
  spaceHistoryId?: string;

  @IsOptional()
  @IsUUID('4')
  @ApiPropertyOptional({
    description: 'SpaceHistory spacePermissionerId in uuid',
    nullable: true,
  })
  spacePermissionerId?: string;

  @IsOptional()
  @IsUUID('4')
  @ApiPropertyOptional({
    description: 'SpaceHistory spaceEventId in uuid',
    nullable: true,
  })
  spaceEventId?: string;

  @IsOptional()
  @IsUUID('4')
  @ApiPropertyOptional({
    description: 'SpaceHistory permissionRequestId in uuid',
    nullable: true,
  })
  permissionRequestId?: string;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({
    description: 'Is SpaceHistory public',
    required: true,
  })
  isPublic: boolean;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'SpaceHistory type',
    required: true,
  })
  type: SpaceHistoryType;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'SpaceHistory title',
    nullable: true,
  })
  title?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'SpaceHistory details',
    nullable: true,
  })
  details?: string;
}
