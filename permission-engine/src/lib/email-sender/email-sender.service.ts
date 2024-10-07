import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EmailSendJobData } from 'src/type';

@Injectable()
export class EmailSenderService {
  constructor(@InjectQueue('email-sender') private readonly queue: Queue) {}

  async addJob(data: EmailSendJobData) {
    await this.queue.add(data, {
      attempts: 3, // Retry 3 times if the job fails
      backoff: 5000, // Wait 5 seconds before retrying
    });
  }
}
