import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entity/user.entity';
import { UserNotification } from 'src/database/entity/user-notification.entity';
import { Logger } from 'src/lib/logger/logger.service';
import configuration from 'src/config/configuration';
import { UserNotificationService } from '../user-notification/user-notification.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    TypeOrmModule.forFeature([User, UserNotification]),
  ],
  controllers: [UserController],
  providers: [UserService, UserNotificationService, Logger],
})
export class UserModule {}
