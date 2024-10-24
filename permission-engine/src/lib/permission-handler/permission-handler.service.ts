import {
  forwardRef,
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PermissionHandlerJobData, PermissionProcessType } from 'src/lib/type';
import { ConfigService } from '@nestjs/config';
import { Logger } from '../logger/logger.service';
import { DataSource, QueryRunner } from 'typeorm';
import { PermissionRequestService } from 'src/api/permission-request/permission-request.service';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

@Injectable()
export class PermissionHandlerService implements OnModuleInit, OnModuleDestroy {
  private readonly redis: Redis | null;
  private isDaemonMode: boolean;
  private isActive: boolean;
  private interval: number = 1000 * 10;
  private fetchCount: number = 10;
  public daemonKey: string = 'daemon:permission-handler';

  constructor(
    @InjectQueue('permission-handler') private readonly queue: Queue,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => PermissionRequestService))
    private readonly permissionRequestService: PermissionRequestService,
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

        this.logger.log('Daemon started: permission-handler');
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

  async addJob(data: PermissionHandlerJobData) {
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

  async findTimeoutReachedPermissionRequests() {
    return await this.permissionRequestService.findAllByTimeout({
      timeout: new Date(),
      page: 1,
      limit: this.fetchCount,
    });
  }

  // check timeout reached permission responses
  async run() {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();

    await queryRunner.startTransaction();

    try {
      const timeoutReachedPermissionRequests =
        await this.findTimeoutReachedPermissionRequests();

      timeoutReachedPermissionRequests?.data?.map(async (permissionRequest) => {
        try {
          await this.addJob({
            permissionProcessType:
              PermissionProcessType.permissionResponseReviewCompleted,
            permissionRequestId: permissionRequest.id,
          });
        } catch (error) {
          this.logger.error(
            `Failed to add permissionResponseReviewCompleted job`,
            error,
          );
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
