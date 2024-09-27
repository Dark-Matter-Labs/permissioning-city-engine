// src/app.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { ValidatorService } from './lib/validator/validator.service';
import { ValidationJobData } from './types';
import { Logger } from './lib/logger/logger.service';

@Controller()
export class AppController {
  constructor(
    private readonly validatorService: ValidatorService,
    private readonly logger: Logger,
  ) {}

  @Post('add-job')
  async addJob(@Body() data: ValidationJobData) {
    await this.validatorService.addJob(data);
    this.logger.log(`Daemon Job request added to the queue: ${data.targetId}`);
    return `Daemon request added to the queue: ${data.targetId}`;
  }
}
