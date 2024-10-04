import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RefreshTokenService } from './refresh-token.service';
import { Logger } from 'src/lib/logger/logger.service';
import configuration from 'src/config/configuration';
import { LoggerModule } from 'src/lib/logger/logger.module';
import { RedisModule } from '@liaoliaots/nestjs-redis';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    LoggerModule,
    RedisModule.forRoot({
      config: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),
  ],
  providers: [RefreshTokenService, Logger],
  exports: [RefreshTokenService],
})
export class RefreshTokenModule {}
