import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserNotificationService } from './user-notification.service';
import { UserNotification } from '../../database/entity/user-notification.entity';
import { Logger } from 'src/lib/logger/logger.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FindAllUserNotificationDto } from './dto';
import { UserService } from '../user/user.service';

@ApiTags('user')
@Controller('api/v1/user/notification')
export class UserNotificationController {
  constructor(
    private readonly userNotificationService: UserNotificationService,
    private readonly userService: UserService,
    private readonly logger: Logger,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get UserNotification by userId' })
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Req() req,
    @Query() query: FindAllUserNotificationDto,
  ): Promise<{ data: UserNotification[]; total: number }> {
    const user = await this.userService.findOneByEmail(req.user.email);
    const { page, limit, statuses } = query;

    return this.userNotificationService.findAll(user.id, {
      page,
      limit,
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
  async complete(@Req() req, @Param('id') id: string): Promise<boolean> {
    const user = await this.userService.findOneByEmail(req.user.email);
    const userNotification = await this.userNotificationService.findOne(id);

    if (!userNotification) {
      throw new BadRequestException(`Notification does not exist: ${id}`);
    }

    if (userNotification.userId !== user.id) {
      throw new ForbiddenException();
    }

    const completeResult = await this.userNotificationService.complete(id);

    return completeResult?.data?.result === true;
  }
}
