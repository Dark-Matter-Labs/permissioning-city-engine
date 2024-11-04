import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  CreateDateColumn,
} from 'typeorm';
import { SpaceEvent } from './space-event.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Space } from './space.entity';

@Entity()
export class TopicFollower {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'uuid' })
  id: string;

  @Column()
  @ApiProperty({ description: 'Topic name in string' })
  name: string;

  @Column()
  @ApiProperty({ description: 'Topic detail in string' })
  details: string;

  @Column({ default: true })
  @ApiProperty({ description: 'Is topic active' })
  isActive: boolean;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @Column()
  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;

  @ManyToMany(() => SpaceEvent, (spaceEvent) => spaceEvent.topics)
  spaceEvents: SpaceEvent[];

  @ManyToMany(() => Space, (space) => space.spaceTopics)
  spaces: Space[];
}
