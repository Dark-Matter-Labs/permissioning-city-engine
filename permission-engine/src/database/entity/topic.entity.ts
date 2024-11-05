import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  CreateDateColumn,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { SpaceEvent } from './space-event.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Rule } from './rule.entity';
import { SpaceTopic } from './space-topic.entity';

@Entity()
export class Topic {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'uuid' })
  id: string;

  @Column()
  @ApiProperty({ description: 'Topic author userId in uuid' })
  authorId: string;

  @Column()
  @ApiProperty({ description: 'Topic name in string' })
  name: string;

  @Column()
  @ApiProperty({ description: 'Topic icon' })
  icon: string;

  @Column()
  @ApiProperty({ description: 'Country' })
  country: string;

  @Column()
  @ApiProperty({ description: 'Region' })
  region: string;

  @Column()
  @ApiProperty({ description: 'City' })
  city: string;

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

  @OneToMany(() => SpaceTopic, (spaceTopic) => spaceTopic.space)
  spaceTopics: SpaceTopic[];

  @ManyToMany(() => SpaceEvent, (spaceEvent) => spaceEvent.topics)
  @JoinTable({ name: 'space_event_topic' })
  spaceEvents: SpaceEvent[];

  @ManyToMany(() => Rule, (rule) => rule.topics)
  @JoinTable({ name: 'rule_topic' })
  rules: Rule[];
}
