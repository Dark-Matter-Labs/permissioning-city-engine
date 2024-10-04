// src/app.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { EmailSenderService } from './lib/email-sender/email-sender.service';
import { EmailSendJobData } from './types';
import { Logger } from './lib/logger/logger.service';

@Controller()
export class AppController {
  constructor(
    private readonly emailSenderService: EmailSenderService,
    private readonly logger: Logger,
  ) {}

  @Post('add-job')
  async addJob(@Body() data: EmailSendJobData) {
    await this.emailSenderService.addJob(data);
    this.logger.log(`Daemon Job request added to the queue: ${data.targetId}`);
    return `Daemon request added to the queue: ${data.targetId}`;
  }
}
