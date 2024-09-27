import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserNotificationController } from './user-notification/user-notification.controller';
import { UserNotificationService } from './user-notification/user-notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entity/user.entity';
import { UserNotification } from 'src/database/entity/user-notification.entity';
import { Logger } from 'src/lib/logger/logger.service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([User, UserNotification])],
  controllers: [UserController, UserNotificationController],
  providers: [UserService, UserNotificationService, Logger],
})
export class UserModule {}
