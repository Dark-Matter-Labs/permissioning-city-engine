// src/app.module.ts
import { Module, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
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
import { NotificationHandlerService } from './lib/notification-handler/notification-handler.service';
import { PermissionResponseModule } from './api/permission-response/permission-response.module';
import { PermissionHandlerService } from './lib/permission-handler/permission-handler.service';
import { PermissionHandlerModule } from './lib/permission-handler/permission-handler.module';
import { EmailModule } from './api/email/email.module';
import { MockupService } from './lib/mockup/mockup.service';
import { MockupModule } from './lib/mockup/mockup.module';
import { SpaceApprovedRuleModule } from './api/space-approved-rule/space-approved-rule.module';
import { TopicModule } from './api/topic/topic.module';

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
    NotificationHandlerModule,
    PermissionHandlerModule,
    AuthModule,
    EmailModule,
    UserNotificationModule,
    UserModule,
    SpaceEventModule,
    SpacePermissionerModule,
    SpaceEquipmentModule,
    SpaceApprovedRuleModule,
    SpaceModule,
    RuleBlockModule,
    RuleModule,
    TopicModule,
    PermissionRequestModule,
    PermissionResponseModule,
    MockupModule,
  ],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule implements OnModuleInit {
  private readonly redis: Redis | null;

  constructor(
    private readonly logger: Logger,
    private readonly databaseService: DatabaseService,
    private readonly redisService: RedisService,
    private readonly notificationHandlerService: NotificationHandlerService,
    private readonly permissionHandlerService: PermissionHandlerService,
    private readonly mockupService: MockupService,
  ) {
    try {
      this.redis = this.redisService.getOrThrow();
    } catch (error) {
      this.logger.error('Failed to load redis', error);
    }
  }

  async onModuleInit() {}
}
