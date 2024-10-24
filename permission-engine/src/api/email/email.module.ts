import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entity/user.entity';
import { UserNotification } from 'src/database/entity/user-notification.entity';
import { Logger } from 'src/lib/logger/logger.service';
import configuration from 'src/config/configuration';
import { UserNotificationService } from '../user-notification/user-notification.service';
import { UserService } from '../user/user.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    TypeOrmModule.forFeature([User, UserNotification]),
    HttpModule,
  ],
  controllers: [EmailController],
  providers: [Logger, EmailService, UserService, UserNotificationService],
  exports: [EmailService],
})
export class EmailModule {}
