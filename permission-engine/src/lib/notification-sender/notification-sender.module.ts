import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NotificationSenderProcessor } from './notification-sender.processor';
import { NotificationSenderService } from './notification-sender.service';
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
      name: 'notification-sender',
    }),
    SESModule,
  ],
  providers: [
    NotificationSenderProcessor,
    NotificationSenderService,
    SESService,
    Logger,
    UserService,
    UserNotificationService,
  ],
  exports: [NotificationSenderService],
})
export class NotificationSenderModule {}
