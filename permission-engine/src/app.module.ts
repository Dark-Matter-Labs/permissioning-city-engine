import path from 'path';
import Redis from 'ioredis';
import { Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { BullModule } from '@nestjs/bull';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { Logger } from './lib/logger/logger.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { DatabaseService } from './database/database.service';
import { AuthModule } from './auth/auth.module';
import { S3Module } from './lib/s3/s3.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { UserModule } from './api/user/user.module';
import { SpaceModule } from './api/space/space.module';
import { SpaceEventModule } from './api/space-event/space-event.module';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { NotificationHandlerModule } from './lib/notification-handler/notification-handler.module';
import { PermissionRequestModule } from './api/permission-request/permission-request.module';
import { RuleModule } from './api/rule/rule.module';
import { SpacePermissionerModule } from './api/space-permissioner/space-permissioner.module';
import { UserNotificationModule } from './api/user-notification/user-notification.module';
import { RuleBlockModule } from './api/rule-block/rule-block.module';
import { SpaceEquipmentModule } from './api/space-equipment/space-equipment.module';
import { PermissionResponseModule } from './api/permission-response/permission-response.module';
import { PermissionHandlerModule } from './lib/permission-handler/permission-handler.module';
import { EmailModule } from './api/email/email.module';
import { MockupService } from './lib/mockup/mockup.service';
import { MockupModule } from './lib/mockup/mockup.module';
import { SpaceApprovedRuleModule } from './api/space-approved-rule/space-approved-rule.module';
import { TopicModule } from './api/topic/topic.module';
import { I18nModule, I18nJsonLoader } from 'nestjs-i18n';
import { WsNotificationGateway } from './lib/ws-notification/ws-notification.gateway';
import { UserService } from './api/user/user.service';
import { UserNotification } from './database/entity/user-notification.entity';
import { User } from './database/entity/user.entity';
import { UserNotificationService } from './api/user-notification/user-notification.service';
import { SpaceHistoryModule } from './api/space-history/space-history.module';
import { SlackService } from './lib/slack/slack.service';
import { SlackModule } from './lib/slack/slack.module';
import dayjs from 'dayjs';
import { AdminModule } from './lib/admin/admin.module';

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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // to use schema.sql
        namingStrategy: new SnakeNamingStrategy(),
      }),
    }),
    TypeOrmModule.forFeature([User, UserNotification]),
    RedisModule.forRoot({
      config: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),
    DatabaseModule,
    S3Module,
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/lib/i18n/'),
        watch: false,
      },
      loader: I18nJsonLoader,
    }),
    ...(process.env.ENGINE_MODE === 'daemon'
      ? [NotificationHandlerModule]
      : []),
    ...(process.env.ENGINE_MODE === 'daemon' ? [PermissionHandlerModule] : []),
    AdminModule,
    AuthModule,
    EmailModule,
    UserNotificationModule,
    UserModule,
    SpaceEventModule,
    SpacePermissionerModule,
    SpaceEquipmentModule,
    SpaceApprovedRuleModule,
    SpaceHistoryModule,
    SpaceModule,
    RuleBlockModule,
    RuleModule,
    TopicModule,
    PermissionRequestModule,
    PermissionResponseModule,
    MockupModule,
    SlackModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    Logger,
    WsNotificationGateway,
    UserService,
    UserNotificationService,
  ],
})
export class AppModule implements OnModuleInit, OnModuleDestroy {
  private readonly redis: Redis | null;

  constructor(
    private readonly logger: Logger,
    private readonly databaseService: DatabaseService,
    private readonly redisService: RedisService,
    private readonly mockupService: MockupService,
    private readonly slackService: SlackService,
  ) {
    try {
      this.redis = this.redisService.getOrThrow();
    } catch (error) {
      this.logger.error('Failed to load redis', error);
    }
  }

  async onModuleInit() {
    if (process.env.SLACK_WEBHOOK_URL) {
      await this.slackService.sendMessage(
        [
          dayjs().format('YYYY-MM-DD HH:mm:ss'),
          `[${process.env.NODE_ENV}]`,
          ['`permissoin-engine-', process.env.ENGINE_MODE, '`'].join(''),
          `is up and running`,
        ].join(' '),
      );
    }
  }

  async onModuleDestroy() {
    if (process.env.SLACK_WEBHOOK_URL) {
      await this.slackService.sendMessage(
        [
          dayjs().format('YYYY-MM-DD HH:mm:ss'),
          `[${process.env.NODE_ENV}]`,
          ['`permissoin-engine-', process.env.ENGINE_MODE, '`'].join(''),
          `has went down`,
        ].join(' '),
      );
    }
  }
}
