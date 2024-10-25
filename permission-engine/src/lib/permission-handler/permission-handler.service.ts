import {
  forwardRef,
  Inject,
  Injectable,
  BeforeApplicationShutdown,
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

  async addJob(data: PermissionHandlerJobData) {
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
