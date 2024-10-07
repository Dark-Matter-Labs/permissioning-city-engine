import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { PermissionRequestStatus } from 'src/lib/type';
import { Rule } from './rule.entity';
import { SpaceEvent } from './space-event.entity';
import { Space } from './space.entity';

@Entity()
export class PermissionRequest {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'uuid' })
  id: string;

  @ManyToOne(() => Space, (space) => space.permissionRequests)
  @JoinColumn()
  space: Space;

  @Column()
  @ApiProperty({ description: 'Space owner userId in uuid' })
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

  @CreateDateColumn()
  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @Column()
  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;

  // TODO. work on permissioner.entity
  // @ManyToMany(
  //   () => Permissioner,
  //   (permissioner) => permissioner.permissionRequests,
  // )
  // permissioners: Permissioner[];
}
