import {
  BeforeApplicationShutdown,
  forwardRef,
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import {
  Language,
  NotificationHandlerJobData,
  SpaceEventStatus,
  UserNotificationTarget,
  UserNotificationTemplateName,
  UserNotificationType,
} from 'src/lib/type';
import { ConfigService } from '@nestjs/config';
import { Logger } from '../logger/logger.service';
import { UserNotificationService } from 'src/api/user-notification/user-notification.service';
import {
  EmailTemplate,
  SpaceEventPermissionRequestCreatedEmail,
  SpaceEventPermissionRequestedEmail,
  WelcomeEmail,
} from '../email-template';
import { DataSource, QueryRunner } from 'typeorm';
import { UserNotification } from 'src/database/entity/user-notification.entity';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { I18nService } from 'nestjs-i18n';
import { countryCodeToLanguage } from 'src/lib/util/locale';
import { SpaceEventService } from 'src/api/space-event/space-event.service';

@Injectable()
export class NotificationHandlerService
  implements OnModuleInit, OnModuleDestroy, BeforeApplicationShutdown
{
  private readonly redis: Redis | null;
  private isDaemonMode: boolean;
  private isActive: boolean;
  private interval: number = 1000 * 5;
  private fetchCount: number = 20;

  public daemonName: string = 'notification-handler';
  public daemonKey: string = `daemon:${this.daemonName}`;
  public daemonId: string = uuidv4();
  private isInit: boolean = false;

  constructor(
    @InjectQueue('notification-handler') private readonly queue: Queue,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => UserNotificationService))
    private readonly userNotificationService: UserNotificationService,
    private readonly spaceEventService: SpaceEventService,
    private readonly i18n: I18nService,
    private readonly redisService: RedisService,
    private readonly logger: Logger,
  ) {
    const engineMode = this.configService.get('ENGINE_MODE');
    const daemons = this.configService.get('DAEMONS');

    if (
      engineMode === 'daemon' &&
      daemons &&
      daemons?.split(',')?.includes(this.daemonName)
    ) {
      this.isDaemonMode = true;
    } else {
      this.isDaemonMode = false;
    }

    try {
      this.redis = this.redisService.getOrThrow();
    } catch (error) {
      this.logger.error('Failed to load redis', error);
      this.isDaemonMode = false;
    }
  }

  async onModuleInit() {
    if (this.isDaemonMode === true) {
      await this.redis.set(this.daemonKey, this.daemonId);

      this.isActive = true;
      this.start();
    }
  }

  async onModuleDestroy() {
    if (this.isDaemonMode === true) {
      await this.redis.del(this.daemonKey);
    }
    this.isActive = false;
  }

  async beforeApplicationShutdown() {
    if (this.isDaemonMode === true) {
      await this.redis.del(this.daemonKey);
    }
  }

  async addJob(data: NotificationHandlerJobData) {
    await this.queue.add(data, {
      attempts: 3, // Retry 3 times if the job fails
      backoff: 5000, // Wait 5 seconds before retrying
    });
  }

  private async start() {
    while (this.isActive === true) {
      const daemonId = await this.redis.get(this.daemonKey);

      if (daemonId !== this.daemonId) {
        this.isActive = false;
        this.logger.debug(
          `Daemon deactivated: ${this.daemonName}(${this.daemonId})`,
        );
        break;
      } else if (this.isInit === true) {
        this.logger.log(`Daemon running: ${this.daemonName}(${this.daemonId})`);
        await this.run();
      } else {
        this.logger.debug(
          `Daemon initiated: ${this.daemonName}(${this.daemonId})`,
        );
        this.isInit = true;
      }

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
      let email: EmailTemplate | null = null;
      const country = userNotification?.user?.country;
      const language = !!country ? countryCodeToLanguage(country) : Language.en;

      switch (userNotification.templateName) {
        case UserNotificationTemplateName.welcome:
          email = new WelcomeEmail(this.i18n, {
            language: language as Language,
            name: userNotification.user.name,
          });
          break;
        case UserNotificationTemplateName.spaceEventPermissionRequestCreated:
          email = new SpaceEventPermissionRequestCreatedEmail(this.i18n, {
            language: language as Language,
            name: userNotification.user.name,
            spaceName: userNotification.params.spaceName,
            timeoutAt: userNotification.params.timeoutAt,
            spaceEventId: userNotification.params.spaceEventId,
          });
          break;
        case UserNotificationTemplateName.spaceEventPermissionRequested:
          email = new SpaceEventPermissionRequestedEmail(this.i18n, {
            language: language as Language,
            name: userNotification.user.name,
            spaceId: userNotification.params.spaceId,
          });
          break;
        // TODO. support other templates
        default:
          break;
      }

      if (email) {
        await this.addJob({
          userNotificationId: userNotification.id,
          to: userNotification.user.email,
          email,
        })
          .then(async () => {
            await this.updateUserNotificationToQueued(
              userNotification.id,
              email,
            );
          })
          .catch((error) => {
            this.logger.error(error.message, error);
            throw error;
          });
      } else {
        throw new Error(
          `There is no email template with name: ${userNotification.templateName}`,
        );
      }
    } catch (error) {
      await this.updateUserNotificationToNoticeFailed(
        userNotification.id,
        error.message,
      );
    }
  }

  async findEndsAtReachedSpaceEvents() {
    return await this.spaceEventService.findAll({
      statuses: [SpaceEventStatus.running],
      endsBefore: new Date(),
      page: 1,
      limit: this.fetchCount,
    });
  }

  async run() {
    await this.handleSpaceEvents();
    await this.handlePendingNotifications();
  }

  async handlePendingNotifications() {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.startTransaction();
      const userNotifications =
        await this.findPendingExternalUserNotifications();

      for (const userNotification of userNotifications) {
        await this.enqueue(userNotification);
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  // check endsAt reached space events
  async handleSpaceEvents() {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.startTransaction();

      const endsAtReachedSpaceEvents =
        await this.findEndsAtReachedSpaceEvents();

      endsAtReachedSpaceEvents?.data?.map(async (spaceEvent) => {
        try {
          await this.spaceEventService.updateToClosed(spaceEvent.id);
          await this.userNotificationService.create({
            userId: spaceEvent.organizerId,
            target: UserNotificationTarget.eventOrgnaizer,
            type: UserNotificationType.external,
            templateName: UserNotificationTemplateName.spaceEventClosed,
            params: {},
          });
        } catch (error) {
          this.logger.error(
            `Failed to add close spaceEvent: ${spaceEvent.id}`,
            error,
          );
          throw error;
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
