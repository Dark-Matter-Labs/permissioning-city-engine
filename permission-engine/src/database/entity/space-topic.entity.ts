import {
  Entity,
  Column,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Space } from './space.entity';
import { Topic } from './topic.entity';

@Entity()
export class SpaceTopic {
  @ManyToOne(() => Space, (space) => space.spaceTopics)
  @JoinColumn()
  space: Space;

  @PrimaryColumn()
  spaceId: string;

  @ManyToOne(() => Topic, (topic) => topic.spaceTopics)
  @JoinColumn()
  topic: Topic;

  @PrimaryColumn()
  topicId: string;

  @Column({ default: true })
  @ApiProperty({ description: 'Is topic desired by space' })
  isDesired: boolean;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @Column()
  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;
}
