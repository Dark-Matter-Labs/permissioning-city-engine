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

  @CreateDateColumn()
  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @Column()
  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;
}
