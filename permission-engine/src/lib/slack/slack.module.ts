import { Module } from '@nestjs/common';
import { SlackService } from './slack.service';
import { ConfigModule } from '@nestjs/config';
import configuration from 'src/config/configuration';
import { Logger } from '../logger/logger.service';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    HttpModule,
  ],
  providers: [SlackService, Logger],
  exports: [SlackService],
})
export class SlackModule {}
