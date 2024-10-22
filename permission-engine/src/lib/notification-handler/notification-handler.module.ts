import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NotificationHandlerProcessor } from './notification-handler.processor';
import { NotificationHandlerService } from './notification-handler.service';
import { Logger } from '../logger/logger.service';
import { SESService } from '../ses/ses.service';
import { SESModule } from '../ses/ses.module';
import { ConfigModule } from '@nestjs/config';
import configuration from 'src/config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entity/user.entity';
import { UserService } from 'src/api/user/user.service';
import { UserNotification } from 'src/database/entity/user-notification.entity';
import { UserNotificationService } from 'src/api/user-notification/user-notification.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    TypeOrmModule.forFeature([User, UserNotification]),
    BullModule.registerQueue({
      name: 'notification-handler',
    }),
    SESModule,
  ],
  providers: [
    NotificationHandlerProcessor,
    NotificationHandlerService,
    SESService,
    Logger,
    UserService,
    UserNotificationService,
  ],
  exports: [NotificationHandlerService],
})
export class NotificationHandlerModule {}
