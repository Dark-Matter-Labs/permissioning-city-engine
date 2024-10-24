import {
  forwardRef,
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import {
  NotificationHandlerJobData,
  UserNotificationTemplateName,
} from 'src/lib/type';
import { ConfigService } from '@nestjs/config';
import { Logger } from '../logger/logger.service';
import { UserNotificationService } from 'src/api/user-notification/user-notification.service';
import { EmailTemplate, WelcomeEmail } from '../email-template';
import { DataSource, QueryRunner } from 'typeorm';
import { SpaceEventPermissionRequestedEmail } from '../email-template/space-event-permission-requested-email';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { UserNotification } from 'src/database/entity/user-notification.entity';

@Injectable()
export class NotificationHandlerService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly redis: Redis | null;
  private isDaemonMode: boolean;
  private isActive: boolean;
  private interval: number = 1000 * 30;
  private fetchCount: number = 100;
  public daemonKey: string = 'daemon:notification-handler';

  constructor(
    @InjectQueue('notification-handler') private readonly queue: Queue,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => UserNotificationService))
    private readonly userNotificationService: UserNotificationService,
    private readonly redisService: RedisService,
    private readonly logger: Logger,
  ) {
    try {
      this.redis = this.redisService.getOrThrow();
    } catch (error) {
      this.logger.error('Failed to load redis', error);
    }
    const engineMode = this.configService.get('ENGINE_MODE');
    const daemons = this.configService.get('DAEMONS');
    if (
      engineMode === 'daemon' &&
      daemons &&
      daemons?.split(',')?.includes('permission-handler')
    ) {
      this.isDaemonMode = true;
    } else {
      this.isDaemonMode = false;
    }
  }

  async onModuleInit() {
    if (this.isDaemonMode === true) {
      const daemonRegistered = await this.redis.get(this.daemonKey);

      if (!daemonRegistered) {
        await this.redis.set(this.daemonKey, 'running');

        this.logger.log('Daemon started: notification-handler');
        this.isActive = true;
        this.start();
      }
    }
  }

  async onModuleDestroy() {
    if (this.isDaemonMode === true) {
      await this.redis.del(this.daemonKey);
    }
    this.isActive = false;
  }

  async addJob(data: NotificationHandlerJobData) {
    await this.queue.add(data, {
      attempts: 3, // Retry 3 times if the job fails
      backoff: 5000, // Wait 5 seconds before retrying
    });
  }

  private async start() {
    while (this.isActive === true) {
      this.logger.debug('Daemon: notification-handler running...');
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

  async updateUserNotificationToNoticeFailed(id: string, errorMessage: string) {
    return await this.userNotificationService.updateToNoticeFailed(
      id,
      errorMessage,
    );
  }

  async enqueue(userNotification: UserNotification) {
    try {
      let email: EmailTemplate;
      switch (userNotification.templateName) {
        case UserNotificationTemplateName.welcome:
          email = new WelcomeEmail({
            name: userNotification.user.name,
          });
          break;
        case UserNotificationTemplateName.spaceEventPermissionRequested:
          email = new SpaceEventPermissionRequestedEmail({
            name: userNotification.user.name,
            space: userNotification.params.space,
          });
          break;
        // TODO. support other templates
        default:
          break;
      }
      await this.addJob({
        userNotificationId: userNotification.id,
        to: userNotification.user.email,
        email,
      });
      await this.updateUserNotificationToQueued(userNotification.id, email);
    } catch (error) {
      await this.updateUserNotificationToNoticeFailed(
        userNotification.id,
        error.message,
      );
    }
  }

  async run() {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();

    await queryRunner.startTransaction();

    try {
      const userNotifications =
        await this.findPendingExternalUserNotifications();

      userNotifications.map(async (userNotification) => {
        await this.enqueue(userNotification);
      });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
