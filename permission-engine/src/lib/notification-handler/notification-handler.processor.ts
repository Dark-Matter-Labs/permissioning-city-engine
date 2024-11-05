import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { SESService } from '../ses/ses.service';
import { Logger } from '../logger/logger.service';
import { UserNotificationService } from 'src/api/user-notification/user-notification.service';

@Processor('notification-handler')
export class NotificationHandlerProcessor {
  constructor(
    private readonly sesService: SESService,
    private readonly userNotificationService: UserNotificationService,
    private readonly logger: Logger,
  ) {}

  @Process({ concurrency: 1 })
  async handleNotificationProcess(job: Job<any>) {
    // Job processing logic
    return await new Promise<string>(async (resolve, reject) => {
      try {
        if (process.env.ENGINE_MODE === 'daemon') {
          this.logger.log('Handling notification:', job.data);
        } else {
          reject();
        }

        // 1. parse job.data into AWS SES send email object type
        // 2. Send email by calling SESService.send() method
        const { to, email } = job.data;
        const sendResult = await this.sesService.send(to, email);

        await this.userNotificationService
          .updateToNoticeSent(job.data.userNotificationId, sendResult.MessageId)
          .then(() => {
            resolve(sendResult.MessageId);
          });
      } catch (error) {
        await this.userNotificationService.updateToNoticeFailed(
          job.data.userNotificationId,
          error.message,
        );
        reject(error);
      } finally {
        this.logger.log('notification-handler: Job completed');
      }
    });
  }
}
