import { Injectable } from '@nestjs/common';
import { Logger } from 'src/lib/logger/logger.service';
import {
  SesBounce,
  SesBounceSubType,
  SesBounceType,
  SesComplaint,
  SesDelivery,
  SesMail,
} from 'src/lib/type';
import { UserService } from '../user/user.service';
import { UserNotificationService } from '../user-notification/user-notification.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EmailService {
  constructor(
    private readonly httpService: HttpService,
    private readonly userService: UserService,
    private readonly userNotificationService: UserNotificationService,
    private readonly logger: Logger,
  ) {}

  async bounce(message: { bounce: SesBounce; mail: SesMail }): Promise<void> {
    /**
     * Permanent: log error and unsubscribe
     * Transient.MailboxFull: resend after interval
     * Undetermined: log error and notify admin
     * Transient.other: log error and notify admin
     */
    const { bounce, mail } = message;
    const { messageId } = mail;
    const { bounceType, bounceSubType, bounceRecipients } = bounce;
    const recipientUsers = await this.userService.findAllByEmails(
      bounceRecipients.map((item) => item.emailAddress),
    );
    const userNotification =
      await this.userNotificationService.findOneByMessageId(messageId);
    if (bounceType === SesBounceType.Permanent) {
      recipientUsers.forEach((user) => {
        this.userService.update(user.email, {
          isSubscribe: false,
        });
      });
    } else if (
      bounceType === SesBounceType.Transient &&
      bounceSubType === SesBounceSubType.MailboxFull
    ) {
      this.logger.log(`Retry due to user notification email bounce`, message);
      this.userNotificationService.updateToPending(userNotification.id);
    } else if (
      [SesBounceType.Transient, SesBounceType.Undetermined].includes(bounceType)
    ) {
      this.logger.log(
        `User notification email bounce must be handled by admin`,
        message,
      );

      await this.userNotificationService.updateToNoticeFailed(
        userNotification.id,
        JSON.stringify(message),
      );
    } else {
      this.logger.log(`Unknown bounceType`, message);

      await this.userNotificationService.updateToNoticeFailed(
        userNotification.id,
        JSON.stringify(message),
      );
    }
  }

  async complaint(message: {
    complaint: SesComplaint;
    mail: SesMail;
  }): Promise<void> {
    const { complaint } = message;
    const { complainedRecipients } = complaint;
    const recipientUsers = await this.userService.findAllByEmails(
      complainedRecipients.map((item) => item.emailAddress),
    );
    recipientUsers.forEach((user) => {
      this.userService.update(user.email, {
        isSubscribe: false,
      });
    });
  }

  async delivery(message: {
    delivery: SesDelivery;
    mail: SesMail;
  }): Promise<void> {
    const { mail } = message;
    const { messageId } = mail;
    const userNotification =
      await this.userNotificationService.findOneByMessageId(messageId);

    await this.userNotificationService.updateToNoticeComplete(
      userNotification.id,
    );
  }

  async firstValueFrom(subscribeUrl: string) {
    return await firstValueFrom(this.httpService.get(subscribeUrl));
  }
}
