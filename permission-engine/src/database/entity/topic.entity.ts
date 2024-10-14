import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  CreateDateColumn,
  JoinTable,
} from 'typeorm';
import { SpaceEvent } from './space-event.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Space } from './space.entity';
import { Rule } from './rule.entity';

@Entity()
export class Topic {
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
  @JoinTable({ name: 'space_event_topic' })
  spaceEvents: SpaceEvent[];

  @ManyToMany(() => Rule, (rule) => rule.topics)
  @JoinTable({ name: 'rule_topic' })
  rules: Rule[];

  @ManyToMany(() => Space, (space) => space.topics)
  spaces: Space[];
}
