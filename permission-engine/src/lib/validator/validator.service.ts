import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ValidationJobData } from 'src/types';

@Injectable()
export class ValidatorService {
  constructor(@InjectQueue('validator') private readonly queue: Queue) {}

  async addJob(data: ValidationJobData) {
    await this.queue.add(data, {
      attempts: 3, // Retry 3 times if the job fails
      backoff: 5000, // Wait 5 seconds before retrying
    });
  }
}
