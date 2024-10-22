import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { SESService } from '../ses/ses.service';
import { Logger } from '../logger/logger.service';
import { UserService } from 'src/api/user/user.service';
import { UserNotificationService } from 'src/api/user-notification/user-notification.service';

@Processor('notification-handler')
export class NotificationHandlerProcessor {
  constructor(
    private readonly sesService: SESService,
    private readonly userService: UserService,
    private readonly userNotificationService: UserNotificationService,
    private readonly logger: Logger,
  ) {}

  @Process()
  async send(job: Job<any>) {
    this.logger.log('Processing send notification:', job.data);
    // Job processing logic
    await new Promise<void>(async (resolve, reject) => {
      try {
        // 1. parse job.data into AWS SES send email object type
        // 2. Send email by calling SESService.send() method
        const { to, email } = job.data;
        await this.sesService.send(to, email);
        await this.userNotificationService.updateToNoticed(job.data.id);
        resolve();
      } catch (error) {
        await this.userNotificationService.updateToNoticeFailed(job.data.id);
        reject(error);
      }
    });

    this.logger.log('Job completed');
  }
}
