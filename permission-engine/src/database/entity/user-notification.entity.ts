import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  UserNotificationStatus,
  UserNotificationTarget,
  UserNotificationType,
} from 'src/lib/type';

@Entity()
export class UserNotification {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'uuid' })
  id: string;

  @ManyToOne(() => User, (user) => user.userNotifications)
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @Column()
  target: UserNotificationTarget;

  @Column()
  type: UserNotificationType;

  @Column()
  status: UserNotificationStatus;

  @Column()
  externalServiceId: string;

  @Column()
  link: string;

  @Column()
  templateName: string;

  @Column()
  subjectPart: string;

  @Column()
  textPart: string;

  @Column()
  htmlPart: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}
