import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { UserNotification } from '../../../database/entity/user-notification.entity';

@Injectable()
export class UserNotificationService {
  constructor(
    @InjectRepository(UserNotification)
    private userNotificationRepository: Repository<UserNotification>,
  ) {}

  findByUserId(userId: string): Promise<UserNotification[]> {
    return this.userNotificationRepository.findBy({ userId });
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
    return this.userNotificationRepository.update(id, { status: 'complete' });
  }
}
