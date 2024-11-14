import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateSpaceEventAdditionalInfoDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'SpaceEvent link for registration or purchase tickets',
  })
  link?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'SpaceEvent callbackLink for permission code submission',
  })
  callbackLink?: string;
}
