import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../../database/entity/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from 'src/lib/logger/logger.service';
import {
  UserNotificationTarget,
  UserNotificationTemplateName,
  UserNotificationType,
} from 'src/lib/type';
import { UserNotificationService } from '../user-notification/user-notification.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly userNotificationService: UserNotificationService,
    private readonly logger: Logger,
  ) {}

  findOne(id: string): Promise<User> {
    return this.userRepository.findOneBy({ id });
  }

  findOneByEmail(email: string): Promise<User> {
    return this.userRepository.findOneBy({ email });
  }

  findAllByEmails(emails: string[]): Promise<User[]> {
    return this.userRepository.find({ where: { email: In(emails) } });
  }

  async remove(email: string): Promise<void> {
    await this.userRepository.delete({ email });
  }

  async create(
    createUserDto: CreateUserDto,
    isNotification: boolean = true,
  ): Promise<{
    data: {
      result: boolean;
      user: User;
    };
  }> {
    let result = true;
    const user = this.userRepository.create({
      ...createUserDto,
      id: uuidv4(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.userRepository.save(user).catch((error) => {
      result = false;
      this.logger.error('Failed to create user', error);
    });

    this.userNotificationService
      .create({
        userId: user.id,
        target: UserNotificationTarget.general,
        type: isNotification
          ? UserNotificationType.external
          : UserNotificationType.internal,
        templateName: UserNotificationTemplateName.welcome,
      })
      .catch((error) => {
        this.logger.error('Failed to create userNotification', error);
      });

    return {
      data: {
        result,
        user,
      },
    };
  }

  async update(
    email: string,
    updateUserDto: UpdateUserDto,
  ): Promise<{ data: { result: boolean } }> {
    const user = await this.findOneByEmail(email);

    const updateResult = await this.userRepository.update(user.id, {
      ...updateUserDto,
      updatedAt: new Date(),
    });

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }
}
