import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { User } from './user.entity';
import { RuleTarget } from 'src/lib/type';
import { SpaceEvent } from './space-event.entity';
import { Space } from './space.entity';
import { RuleBlock } from './rule-block.entity';
import { PermissionRequest } from './permission-request.entity';

@Entity()
export class Rule {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'uuid' })
  id: string;

  @Column()
  @ApiProperty({ description: 'Rule name' })
  name: string;

  @Column()
  @ApiProperty({ description: 'Rule hash' })
  hash: string;

  @ManyToOne(() => User, (user) => user.rules)
  @JoinColumn()
  author: User;

  @Column()
  @ApiProperty({ description: 'Rule author userId in uuid' })
  authorId: string;

  @ManyToOne(() => Rule, (rule) => rule.childRules)
  @JoinColumn()
  parentRule: Rule;

  @OneToMany(() => Rule, (rule) => rule.parentRule)
  childRules: Rule[];

  @Column({ nullable: true })
  @ApiProperty({ description: 'Rule parentRuleId in uuid' })
  parentRuleId: string;

  @Column()
  @ApiProperty({ description: 'Rule target: space|space_event' })
  target: RuleTarget;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @Column()
  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;

  @OneToMany(() => Space, (space) => space.rule)
  spaces: Space[];

  @OneToMany(() => SpaceEvent, (spaceEvent) => spaceEvent.rule)
  spaceEvents: SpaceEvent[];

  @ManyToMany(() => RuleBlock, (ruleBlock) => ruleBlock.rules)
  @JoinTable()
  ruleBlocks: RuleBlock[];

  @OneToMany(
    () => PermissionRequest,
    (permissionRequest) => permissionRequest.space,
  )
  permissionRequests: PermissionRequest[];
}
