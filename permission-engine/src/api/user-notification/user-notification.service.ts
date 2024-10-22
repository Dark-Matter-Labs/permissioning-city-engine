import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { UserNotification } from '../../database/entity/user-notification.entity';
import { UserNotificationStatus, UserNotificationType } from 'src/lib/type';
import { FindAllUserNotificationDto } from './dto';
import { v4 as uuidv4 } from 'uuid';
import { EmailTemplate } from 'src/lib/email-template';

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

  async findPendingExternal(limit: number = 100): Promise<UserNotification[]> {
    return await this.userNotificationRepository.find({
      where: {
        status: UserNotificationStatus.pending,
        type: UserNotificationType.external,
      },
      relations: ['user'],
      order: {
        createdAt: 'ASC',
      },
      take: limit,
    });
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
    const user = this.userNotificationRepository.create({
      ...userNotificationData,
      id: uuidv4(),
    });
    return this.userNotificationRepository.save(user);
  }

  async updateToQueued(
    id: string,
    email: EmailTemplate,
  ): Promise<{ data: { result: boolean } }> {
    const updateResult = await this.userNotificationRepository.update(id, {
      status: UserNotificationStatus.queued,
      subjectPart: email.subject,
      textPart: email.text,
      htmlPart: email.html,
      updatedAt: new Date(),
    });

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }

  async updateToNoticed(id: string): Promise<{ data: { result: boolean } }> {
    const updateResult = await this.userNotificationRepository.update(id, {
      status: UserNotificationStatus.noticed,
      updatedAt: new Date(),
    });

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }

  async updateToNoticeFailed(
    id: string,
  ): Promise<{ data: { result: boolean } }> {
    const updateResult = await this.userNotificationRepository.update(id, {
      status: UserNotificationStatus.noticeFailed,
      updatedAt: new Date(),
    });

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }

  async complete(id: string): Promise<{ data: { result: boolean } }> {
    const updateResult = await this.userNotificationRepository.update(id, {
      status: UserNotificationStatus.complete,
      updatedAt: new Date(),
    });

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }
}
