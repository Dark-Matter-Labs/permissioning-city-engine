import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';

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
  userType:
    | 'space_owner'
    | 'event_orgnaizer'
    | 'event_attendee'
    | 'permissioner'
    | 'topic_follower'
    | 'space_follower'
    | 'rule_author';

  @Column()
  type: 'internal' | 'external';

  @Column()
  status: 'pending' | 'complete' | 'failed';

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

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}
