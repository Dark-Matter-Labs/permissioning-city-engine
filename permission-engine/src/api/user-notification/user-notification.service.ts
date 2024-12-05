import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, LessThanOrEqual, Repository } from 'typeorm';
import { UserNotification } from '../../database/entity/user-notification.entity';
import { UserNotificationStatus, UserNotificationType } from 'src/lib/type';
import { CreateUserNotificationDto, FindAllUserNotificationDto } from './dto';
import { v4 as uuidv4 } from 'uuid';
import { EmailTemplate } from 'src/lib/email-template';
import dayjs from 'dayjs';
import { selectHtmlElement } from 'src/lib/util';

@Injectable()
export class UserNotificationService {
  constructor(
    @InjectRepository(UserNotification)
    private userNotificationRepository: Repository<UserNotification>,
  ) {}

  async findAll(
    userId: string,
    findAllUserNotificationDto: FindAllUserNotificationDto,
  ): Promise<{ data: UserNotification[]; total: number }> {
    const { page, limit, statuses } = findAllUserNotificationDto;

    const where: FindOptionsWhere<UserNotification> = {};

    where.userId = userId;

    if (statuses != null) {
      where.status = In(statuses);
    }

    const [data, total] = await this.userNotificationRepository.findAndCount({
      where,
      order: {
        createdAt: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: data ?? [],
      total: Number(total),
    };
  }

  async findAllPending(limit: number = 100): Promise<UserNotification[]> {
    return await this.userNotificationRepository.find({
      where: [
        {
          status: UserNotificationStatus.pending,
        },
        {
          status: UserNotificationStatus.queued,
          createdAt: LessThanOrEqual(dayjs().subtract(1, 'm').toDate()),
          type: UserNotificationType.external,
        },
      ],
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

  findOneByMessageId(messageId: string): Promise<UserNotification> {
    return this.userNotificationRepository.findOneBy({ messageId });
  }

  async remove(id: string): Promise<void> {
    await this.userNotificationRepository.delete(id);
  }

  create(
    createUserNotificationDto: CreateUserNotificationDto,
  ): Promise<UserNotification> {
    const userNotification = this.userNotificationRepository.create({
      ...createUserNotificationDto,
      status: UserNotificationStatus.pending,
      id: uuidv4(),
    });

    return this.userNotificationRepository.save(userNotification);
  }

  async updateToPending(id: string): Promise<{ data: { result: boolean } }> {
    const updateResult = await this.userNotificationRepository.update(id, {
      status: UserNotificationStatus.pending,
      updatedAt: new Date(),
    });

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }

  async updateContent(
    id: string,
    email: EmailTemplate,
  ): Promise<{ data: { result: boolean } }> {
    const { html } = email;

    if (html) {
      email.html = selectHtmlElement(email.html, '.content');
    }

    const updateResult = await this.userNotificationRepository.update(id, {
      subjectPart: email?.subject ?? '',
      textPart: email?.text ?? '',
      htmlPart: email?.html ?? '',
      updatedAt: new Date(),
    });

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }

  async updateToQueued(id: string): Promise<{ data: { result: boolean } }> {
    const updateResult = await this.userNotificationRepository.update(id, {
      status: UserNotificationStatus.queued,
      updatedAt: new Date(),
    });

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }

  async updateToNoticeSent(
    id: string,
    messageId?: string,
  ): Promise<{ data: { result: boolean } }> {
    const dto: { messageId?: string } = {};

    if (typeof messageId === 'string') {
      dto.messageId = messageId;
    }

    const updateResult = await this.userNotificationRepository.update(id, {
      ...dto,
      status: UserNotificationStatus.noticeSent,
      updatedAt: new Date(),
    });

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }

  async updateToNoticeComplete(
    id: string,
  ): Promise<{ data: { result: boolean } }> {
    const updateResult = await this.userNotificationRepository.update(id, {
      status: UserNotificationStatus.noticeComplete,
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
    errorMessage?: string,
  ): Promise<{ data: { result: boolean } }> {
    const dto: Partial<UserNotification> = {
      status: UserNotificationStatus.noticeFailed,
      updatedAt: new Date(),
    };

    if (errorMessage) {
      dto.errorMessage = errorMessage;
    }

    const updateResult = await this.userNotificationRepository.update(id, dto);

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
