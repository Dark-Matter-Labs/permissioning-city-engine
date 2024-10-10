// src/app.module.ts
import { Module, OnModuleInit } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { ValidatorModule } from './lib/validator/validator.module';
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
import { EmailSenderModule } from './lib/email-sender/email-sender.module';
import { PermissionRequestModule } from './api/permission-request/permission-request.module';
import { RuleModule } from './api/rule/rule.module';
import { SpacePermissionerModule } from './api/space-permissioner/space-permissioner.module';
import { UserNotificationModule } from './api/user-notification/user-notification.module';
import { RuleBlockModule } from './api/rule-block/rule-block.module';

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
    ValidatorModule,
    EmailSenderModule,
    AuthModule,
    UserNotificationModule,
    UserModule,
    SpaceEventModule,
    SpacePermissionerModule,
    SpaceModule,
    RuleBlockModule,
    RuleModule,
    PermissionRequestModule,
  ],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly databaseService: DatabaseService) {}

  async onModuleInit() {
    // Ensure the schema is created at startup
    await this.databaseService.createSchema();
  }
}
