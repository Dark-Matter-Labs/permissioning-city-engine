import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Space } from './space.entity';
import { Topic } from './topic.entity';

@Entity()
export class SpaceEvent {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'uuid' })
  id: string;

  @Column()
  @ApiProperty({ description: 'Event name' })
  name: string;

  @ManyToOne(() => User, (user) => user.spaceEvents)
  @JoinColumn()
  organizer: User;

  @Column()
  @ApiProperty({ description: 'Event organizer userId in uuid' })
  organizerId: string;

  @ManyToOne(() => Space, (space) => space.spaceEvents)
  @JoinColumn()
  space: Space;

  @Column()
  spaceId: string;

  @ManyToMany(() => Topic, (topic) => topic.spaceEvents)
  @JoinTable()
  topics: Topic;

  @Column()
  topicId: string;

  @Column()
  permissionRequestId: string;

  @Column()
  externalServiceId: string;

  @Column()
  status:
    | 'pending'
    | 'permission_requested'
    | 'permission_approved'
    | 'permission_rejected'
    | 'running'
    | 'complete';

  @Column()
  details: string;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  link: string;

  @Column()
  duration: string;

  @Column()
  startAt: Date;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @Column()
  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;
}
