import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserNotificationController } from './/user-notification.controller';
import { UserNotificationService } from './/user-notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entity/user.entity';
import { UserNotification } from 'src/database/entity/user-notification.entity';
import { Logger } from 'src/lib/logger/logger.service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([User, UserNotification])],
  controllers: [UserNotificationController],
  providers: [UserNotificationService, Logger],
})
export class UserNotificationModule {}
