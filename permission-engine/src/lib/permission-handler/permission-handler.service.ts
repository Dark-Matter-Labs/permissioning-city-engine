import {
  forwardRef,
  Inject,
  Injectable,
  BeforeApplicationShutdown,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import {
  PermissionHandlerJobData,
  PermissionProcessType,
  PermissionRequestStatus,
} from 'src/lib/type';
import { ConfigService } from '@nestjs/config';
import { Logger } from '../logger/logger.service';
import { DataSource } from 'typeorm';
import { PermissionRequestService } from 'src/api/permission-request/permission-request.service';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PermissionHandlerService
  implements OnModuleInit, OnModuleDestroy, BeforeApplicationShutdown
{
  private readonly redis: Redis | null;
  private isDaemonMode: boolean;
  private isActive: boolean;
  private interval: number = 1000 * 10;
  private fetchCount: number = 10;
  public daemonName: string = 'permission-handler';
  public daemonKey: string = `daemon:${this.daemonName}`;
  public daemonId: string = uuidv4();
  private isInit: boolean = false;

  constructor(
    @InjectQueue('permission-handler') private readonly queue: Queue,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => PermissionRequestService))
    private readonly permissionRequestService: PermissionRequestService,
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

  async addJob(data: PermissionHandlerJobData): Promise<Job> {
    return await this.queue.add('permission-handler-job', data, {
      attempts: 3, // Retry 3 times if the job fails
      backoff: 5000, // Wait 5 seconds before retrying
    });
  }

  private async start() {
    while (this.isActive === true && this.isDaemonMode === true) {
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

  async findTimeoutReachedPermissionRequests() {
    return await this.permissionRequestService.findAllByTimeout({
      timeout: new Date(),
      page: 1,
      limit: this.fetchCount,
    });
  }

  async findAssignedPermissionRequests() {
    return await this.permissionRequestService.findAll({
      statuses: [PermissionRequestStatus.assigned],
      page: 1,
      limit: this.fetchCount,
    });
  }

  async findPendingPermissionRequests() {
    return await this.permissionRequestService.findAllPending(this.fetchCount);
  }

  async run() {
    const jobCounts = await this.queue.getJobCounts();

    if (jobCounts) {
      this.logger.debug('permission-handler-job jobCounts', jobCounts);
    }

    const delayedJobs = await this.queue.getDelayed();

    if (delayedJobs && delayedJobs.length > 0) {
      this.logger.debug('permission-handler-job Delayed Jobs:', delayedJobs);
    }

    const failedJobs = await this.queue.getFailed();
    failedJobs.forEach((job) => {
      try {
        throw new Error(
          `permission-handler-job Failed Job: ${JSON.stringify({
            id: job.id,
            data: job.data,
            failedReason: job.failedReason,
          })}`,
        );
      } catch (error) {
        this.logger.error(error.message, error);
      }
    });

    await this.handlePermissionRequests();
  }

  // check timeout reached permission responses
  async handlePermissionRequests() {
    try {
      const timeoutReachedPermissionRequests =
        (await this.findTimeoutReachedPermissionRequests())?.data ?? [];
      const assignedPermissionRequests =
        (await this.findAssignedPermissionRequests())?.data ?? [];

      for (const permissionRequest of [
        ...timeoutReachedPermissionRequests,
        ...assignedPermissionRequests,
      ]) {
        try {
          await this.addJob({
            permissionProcessType:
              PermissionProcessType.permissionResponseReviewCompleted,
            permissionRequestId: permissionRequest.id,
          }).catch((error) => {
            this.logger.error(error.message, error);
            throw error;
          });
        } catch (error) {
          this.logger.error(
            `Failed to add permissionResponseReviewCompleted job`,
            error,
          );
        }
      }

      const pendingPermissionRequests =
        (await this.findPendingPermissionRequests()) ?? [];

      this.logger.log(
        [
          'permission-handler:',
          pendingPermissionRequests.map((item) => item.id).join(','),
        ].join(' '),
      );
      for (const permissionRequest of pendingPermissionRequests) {
        try {
          await this.addJob({
            permissionProcessType: permissionRequest.processType,
            permissionRequestId: permissionRequest.id,
          })
            .then(async () => {
              await this.permissionRequestService.updateToQueued(
                permissionRequest.id,
              );
            })
            .catch((error) => {
              this.logger.error(error.message, error);
              throw error;
            });
        } catch (error) {
          this.logger.error(
            `Failed to add permissionResponseReviewCompleted job`,
            error,
          );
        }
      }
    } catch (error) {
      this.logger.error(error.message, error);
    }
  }
}
