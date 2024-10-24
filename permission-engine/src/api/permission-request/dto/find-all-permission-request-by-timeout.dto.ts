import { IsNotEmpty, IsDate } from 'class-validator';
import { PaginationDto } from 'src/lib/dto';

export class FindAllPermissionRequestByTimeoutDto extends PaginationDto {
  @IsNotEmpty()
  @IsDate()
  timeout: Date;
}
