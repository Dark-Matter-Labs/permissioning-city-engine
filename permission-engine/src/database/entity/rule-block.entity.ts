import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum RuleBlockType {
  // space
  spaceGeneral = 'space_general',
  spaceConsentMethod = 'space_consent_method',
  spacePostEventCheck = 'space_post_event_check',
  // spaceEvent
  spaceEventGeneral = 'space_event_general',
}

@Entity()
export class RuleBlock {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'uuid' })
  id: string;

  @Column()
  @ApiProperty({ description: 'Rule block name' })
  name: string;

  @Column()
  @ApiProperty({ description: 'Rule block hash' })
  hash: string;

  @ManyToOne(() => User, (user) => user.ruleBlocks)
  @JoinColumn()
  author: User;

  @Column()
  @ApiProperty({ description: 'Rule block author userId in uuid' })
  authorId: string;

  @Column()
  @ApiProperty({ description: 'Rule block type' })
  type: RuleBlockType;

  @Column()
  @ApiProperty({ description: 'Rule block content' })
  content: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @Column()
  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;
}
