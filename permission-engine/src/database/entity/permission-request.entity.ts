import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import {
  PermissionProcessType,
  PermissionRequestResolveStatus,
  PermissionRequestStatus,
} from 'src/lib/type';
import { Rule } from './rule.entity';
import { SpaceEvent } from './space-event.entity';
import { Space } from './space.entity';
import { PermissionResponse } from './permission-response.entity';
import { SpaceApprovedRule } from './space-approved-rule.entity';
import { SpaceHistory } from './space-history.entity';

@Entity()
export class PermissionRequest {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'uuid' })
  id: string;

  @ManyToOne(() => Space, (user) => user.permissionRequests)
  @JoinColumn()
  user: Space;

  @Column()
  @ApiProperty({ description: 'PermissionRequest userId in uuid' })
  userId: string;

  @ManyToOne(() => Space, (space) => space.permissionRequests)
  @JoinColumn()
  space: Space;

  @Column()
  @ApiProperty({ description: 'PermissionRequest spaceId in uuid' })
  spaceId: string;

  @ManyToOne(() => SpaceEvent, (spaceEvent) => spaceEvent.permissionRequests)
  @JoinColumn()
  spaceEvent: SpaceEvent;

  @Column()
  @ApiProperty({ description: 'PermissionRequest spaceEventId' })
  spaceEventId: string;

  @ManyToOne(() => Rule, (rule) => rule.permissionRequests)
  @JoinColumn()
  spaceRule: Rule;

  @Column()
  @ApiProperty({ description: 'PermissionRequest spaceRuleId' })
  spaceRuleId: string;

  @ManyToOne(() => Rule, (rule) => rule.permissionRequests)
  @JoinColumn()
  spaceEventRule: Rule;

  @Column()
  @ApiProperty({ description: 'PermissionRequest spaceEventRuleId' })
  spaceEventRuleId: string;

  @Column()
  @ApiProperty({ description: 'PermissionRequest status', default: 'pending' })
  status: PermissionRequestStatus;

  @Column()
  @ApiProperty({
    description: 'PermissionRequest process type',
    default: PermissionProcessType.spaceEventPermissionRequestCreated,
  })
  processType: PermissionProcessType;

  @Column()
  @ApiProperty({
    description: 'PermissionRequest resolve status',
  })
  resolveStatus: PermissionRequestResolveStatus;

  @Column()
  @ApiProperty({ description: 'PermissionRequest permissionCode' })
  permissionCode: string;

  @Column()
  @ApiProperty({ description: 'PermissionRequest resolveDetails' })
  resolveDetails: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @Column()
  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;

  @OneToMany(
    () => PermissionResponse,
    (permissionResponse) => permissionResponse.permissionRequest,
  )
  permissionResponses: PermissionResponse[];

  @OneToMany(
    () => SpaceApprovedRule,
    (spaceApprovedRule) => spaceApprovedRule.permissionRequest,
  )
  spaceApprovedRules: SpaceApprovedRule[];

  @OneToMany(
    () => SpaceHistory,
    (spaceHistory) => spaceHistory.permissionRequest,
  )
  spaceHistories: SpaceHistory[];
}
