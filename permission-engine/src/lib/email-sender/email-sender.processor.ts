import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { SESService } from '../ses/ses.service';
import { Logger } from '../logger/logger.service';

@Processor('email-sender')
export class EmailSenderProcessor {
  constructor(
    private readonly sesService: SESService,
    private readonly logger: Logger,
  ) {}

  @Process()
  async send(job: Job<any>) {
    this.logger.log('Processing send email:', job.data);
    // Job processing logic
    await new Promise((resolve, reject) => {
      try {
        // 1. parse job.data into AWS SES send email object type
        // 2. Send email by calling SESService.send() method
      } catch (error) {
        reject(error);
      }
    });

    this.logger.log('Job completed');
  }
}
