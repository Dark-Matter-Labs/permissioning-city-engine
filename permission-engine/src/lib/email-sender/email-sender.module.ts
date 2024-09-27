import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { EmailSenderProcessor } from './email-sender.processor';
import { EmailSenderService } from './email-sender.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'EmailSender',
    }),
  ],
  providers: [EmailSenderProcessor, EmailSenderService],
  exports: [EmailSenderService],
})
export class EmailSenderModule {}
