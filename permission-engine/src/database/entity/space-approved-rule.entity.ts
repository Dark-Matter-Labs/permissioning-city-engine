import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  PrimaryColumn,
} from 'typeorm';
import { Space } from './space.entity';
import { Rule } from './rule.entity';
import { PermissionRequest } from './permission-request.entity';

@Entity()
export class SpaceApprovedRule {
  @ManyToOne(() => Space, (space) => space.spaceApprovedRules)
  @JoinColumn({ name: 'space_id' })
  space: Space;

  @PrimaryColumn({ name: 'space_id' })
  spaceId: string;

  @ManyToOne(() => Rule, (rule) => rule.spaceApprovedRules)
  @JoinColumn({ name: 'rule_id' })
  rule: Rule;

  @PrimaryColumn({ name: 'rule_id' })
  ruleId: string;

  @ManyToOne(
    () => PermissionRequest,
    (permissionRequest) => permissionRequest.spaceApprovedRules,
  )
  @JoinColumn()
  permissionRequest: PermissionRequest;

  @PrimaryColumn()
  permissionRequestId: string;

  @Column()
  @ApiProperty({ description: 'Space approved rule public hash' })
  publicHash: string;

  @Column({ default: true })
  @ApiProperty({ description: 'Is space approved rule active' })
  isActive: boolean;

  @Column({ default: true })
  @ApiProperty({
    description: 'Space approved rule has public rule blocks only',
  })
  isPublic: boolean;

  @Column({ default: 0 })
  @ApiProperty({
    description: 'How many times the rule was utilized in the space',
  })
  utilizationCount: number;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @Column()
  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;
}
