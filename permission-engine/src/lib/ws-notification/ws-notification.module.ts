import { Module } from '@nestjs/common';
import { WsNotificationGateway } from './ws-notification.gateway';
import { Logger } from '../logger/logger.service';
import { UserService } from 'src/api/user/user.service';
import configuration from 'src/config/configuration';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserNotification } from 'src/database/entity/user-notification.entity';
import { User } from 'src/database/entity/user.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UserNotificationService } from 'src/api/user-notification/user-notification.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}s`,
        },
      }),
    }),
    TypeOrmModule.forFeature([User, UserNotification]),
  ],
  providers: [
    WsNotificationGateway,
    Logger,
    JwtService,
    UserService,
    UserNotificationService,
  ],
  exports: [WsNotificationGateway],
})
export class WsNotificationModule {}
