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
  @JoinColumn()
  space: Space;

  @PrimaryColumn()
  spaceId: string;

  @ManyToOne(() => Rule, (rule) => rule.spaceApprovedRules)
  @JoinColumn()
  rule: Rule;

  @PrimaryColumn()
  ruleId: string;

  @ManyToOne(
    () => PermissionRequest,
    (permissionRequest) => permissionRequest.spaceApprovedRules,
  )
  @JoinColumn()
  permissionRequest: PermissionRequest;

  @PrimaryColumn()
  permissionRequestId: string;

  @Column({ default: true })
  @ApiProperty({ description: 'Is space approved rule active' })
  isActive: boolean;

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
