import { Module } from '@nestjs/common';
import { SESService } from './ses.service';
import { ConfigModule } from '@nestjs/config';
import configuration from 'src/config/configuration';
import { Logger } from '../logger/logger.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  providers: [SESService, Logger],
  exports: [SESService],
})
export class SESModule {}
