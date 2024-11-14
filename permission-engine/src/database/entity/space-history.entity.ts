import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { SpaceHistoryType } from 'src/lib/type';
import { Space } from './space.entity';
import { Rule } from './rule.entity';
import { SpacePermissioner } from './space-permissioner.entity';
import { SpaceEvent } from './space-event.entity';
import { PermissionRequest } from './permission-request.entity';

@Entity()
export class SpaceHistory {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'uuid' })
  id: string;

  @ManyToOne(() => Space, (space) => space.spaceHistories)
  @JoinColumn()
  space: Space;

  @Column()
  @ApiProperty({ description: 'SpaceHistory spaceId in uuid' })
  spaceId: string;

  @ManyToOne(() => Rule, (rule) => rule.spaceHistories)
  @JoinColumn()
  rule: Rule;

  @Column()
  @ApiProperty({ description: 'SpaceHistory ruleId in uuid' })
  ruleId: string;

  @ManyToOne(
    () => SpacePermissioner,
    (spacePermissioner) => spacePermissioner.spaceHistories,
  )
  @JoinColumn()
  spacePermissioner: SpacePermissioner;

  @Column()
  @ApiProperty({ description: 'SpaceHistory spacePermissionerId in uuid' })
  spacePermissionerId: string;

  @ManyToOne(() => SpaceEvent, (spaceEvent) => spaceEvent.spaceHistories)
  @JoinColumn()
  spaceEvent: SpaceEvent;

  @Column()
  @ApiProperty({ description: 'SpaceHistory spaceEventId in uuid' })
  spaceEventId: string;

  @ManyToOne(
    () => PermissionRequest,
    (permissionRequest) => permissionRequest.spaceHistories,
  )
  @JoinColumn()
  permissionRequest: PermissionRequest;

  @Column()
  @ApiProperty({ description: 'SpaceHistory permissionRequestId in uuid' })
  permissionRequestId: string;

  @Column({ default: true })
  @ApiProperty({ description: 'Is SpaceHistory public' })
  isPublic: boolean;

  @Column()
  @ApiProperty({
    description: 'SpaceHistory type',
  })
  type: SpaceHistoryType;

  @Column()
  @ApiProperty({ description: 'SpaceHistory description' })
  details: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;
}
