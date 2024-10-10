import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserNotificationService } from './user-notification.service';
import { UserNotification } from '../../database/entity/user-notification.entity';
import { Logger } from 'src/lib/logger/logger.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FindAllUserNotificationDto } from './dto';

@ApiTags('user')
@Controller('api/v1/user/notification')
export class UserNotificationController {
  constructor(
    private readonly userNotificationService: UserNotificationService,
    private readonly logger: Logger,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get UserNotification by userId' })
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query() query: FindAllUserNotificationDto,
  ): Promise<{ data: UserNotification[]; total: number }> {
    const { page, limit, userId, statuses } = query;

    if (limit > 100) {
      // limit cannot exceed 100
      throw new ForbiddenException();
    }

    return this.userNotificationService.findAll({
      page,
      limit,
      userId,
      statuses,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get UserNotification by id' })
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string): Promise<UserNotification> {
    return this.userNotificationService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update pending UserNotification to complete' })
  complete(@Param('id') id: string): Promise<boolean> {
    return this.userNotificationService
      .complete(id)
      .then((res) => {
        if (res.affected === 1) {
          return true;
        } else {
          throw new BadRequestException(`Notification does not exist: ${id}`);
        }
      })
      .catch((e) => {
        this.logger.debug(e.message);
        return false;
      });
  }
}
