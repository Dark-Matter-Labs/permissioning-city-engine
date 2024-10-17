import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import {
  NotificationSendJobData,
  UserNotificationTemplateName,
} from 'src/lib/type';
import { ConfigService } from '@nestjs/config';
import { Logger } from '../logger/logger.service';
import { UserNotificationService } from 'src/api/user-notification/user-notification.service';
import { EmailTemplate, WelcomeEmail } from '../email-template';
import { DataSource, QueryRunner } from 'typeorm';

@Injectable()
export class NotificationSenderService
  implements OnModuleInit, OnModuleDestroy
{
  private isActive: boolean;
  private interval: number = 1000;
  private fetchCount: number = 10;

  constructor(
    @InjectQueue('notification-sender') private readonly queue: Queue,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    private readonly userNotificationService: UserNotificationService,
    private readonly logger: Logger,
  ) {}

  onModuleInit() {
    const engineMode = this.configService.get('ENGINE_MODE');
    if (engineMode === 'daemon') {
      this.isActive = true;
      this.start();
    }
  }

  onModuleDestroy() {
    this.isActive = false;
  }

  async addJob(data: NotificationSendJobData) {
    await this.queue.add(data, {
      attempts: 3, // Retry 3 times if the job fails
      backoff: 5000, // Wait 5 seconds before retrying
    });
  }

  private async start() {
    while (this.isActive === true) {
      await this.run();
      await this.sleep(this.interval);
    }
  }

  sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async findPendingExternalUserNotifications() {
    return await this.userNotificationService.findPendingExternal(
      this.fetchCount,
    );
  }

  async updateUserNotificationToQueued(id: string, email: EmailTemplate) {
    return await this.userNotificationService.updateToQueued(id, email);
  }

  async updateUserNotificationToNoticeFailed(id: string) {
    return await this.userNotificationService.updateToNoticeFailed(id);
  }

  async run() {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();

    await queryRunner.startTransaction();

    try {
      const userNotifications =
        await this.findPendingExternalUserNotifications();

      userNotifications.map(async (userNotification) => {
        try {
          let email: EmailTemplate;
          switch (userNotification.templateName) {
            case UserNotificationTemplateName.welcome:
              email = new WelcomeEmail({ name: userNotification.user.name });
              break;
            // TODO. support other templates
            default:
              break;
          }
          await this.addJob({
            id: userNotification.id,
            to: userNotification.user.email,
            email,
          });
          await this.updateUserNotificationToQueued(userNotification.id, email);
        } catch (error) {
          await this.updateUserNotificationToNoticeFailed(userNotification.id);
        }
      });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
