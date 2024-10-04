import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { EmailSenderProcessor } from './email-sender.processor';
import { EmailSenderService } from './email-sender.service';
import { Logger } from '../logger/logger.service';
import { SESService } from '../ses/ses.service';
import { SESModule } from '../ses/ses.module';
import { ConfigModule } from '@nestjs/config';
import configuration from 'src/config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    BullModule.registerQueue({
      name: 'email-sender',
    }),
    SESModule,
  ],
  providers: [EmailSenderProcessor, EmailSenderService, SESService, Logger],
  exports: [EmailSenderService],
})
export class EmailSenderModule {}
