import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository, UpdateResult } from 'typeorm';
import { UserNotification } from '../../database/entity/user-notification.entity';
import { UserNotificationStatus } from 'src/lib/type';
import { FindAllUserNotificationDto } from './dto';

@Injectable()
export class UserNotificationService {
  constructor(
    @InjectRepository(UserNotification)
    private userNotificationRepository: Repository<UserNotification>,
  ) {}

  async findAll(
    findAllUserNotificationDto: FindAllUserNotificationDto,
  ): Promise<{ data: UserNotification[]; total: number }> {
    const { page, limit, userId, statuses } = findAllUserNotificationDto;

    const where: FindOptionsWhere<UserNotification> = {};

    where.userId = userId;

    if (statuses != null) {
      where.status = In(statuses);
    }

    const [data, total] = await this.userNotificationRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: data ?? [],
      total,
    };
  }

  findOne(id: string): Promise<UserNotification> {
    return this.userNotificationRepository.findOneBy({ id });
  }

  async remove(id: string): Promise<void> {
    await this.userNotificationRepository.delete(id);
  }

  create(
    userNotificationData: Partial<UserNotification>,
  ): Promise<UserNotification> {
    const user = this.userNotificationRepository.create(userNotificationData);
    return this.userNotificationRepository.save(user);
  }

  complete(id: string): Promise<UpdateResult> {
    return this.userNotificationRepository.update(id, {
      status: UserNotificationStatus.complete,
    });
  }
}
