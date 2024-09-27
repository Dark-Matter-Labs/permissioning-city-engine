import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

export enum RuleType {
  space = 'space',
  spaceEvent = 'space_event',
}

@Entity()
export class Rule {
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
  type: RuleType;

  @Column()
  @ApiProperty({ description: 'Rule block content' })
  content: string;

  @Column()
  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @Column()
  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;
}
