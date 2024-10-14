import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Space } from './space.entity';
import { Topic } from './topic.entity';
import { Matches } from 'class-validator';
import { SpaceEventStatus } from 'src/lib/type';
import { Rule } from './rule.entity';
import { PermissionRequest } from './permission-request.entity';
import { ExternalService } from './external-service.entity';
import { SpaceEventImage } from './space-event-image.entity';

@Entity()
export class SpaceEvent {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'uuid' })
  id: string;

  @Column()
  @ApiProperty({ description: 'Event name' })
  name: string;

  @ManyToOne(() => User, (user) => user.spaceEvents)
  @JoinColumn()
  organizer: User;

  @Column()
  @ApiProperty({ description: 'Event organizer userId in uuid' })
  organizerId: string;

  @ManyToOne(() => Space, (space) => space.spaceEvents)
  @JoinColumn()
  space: Space;

  @Column()
  spaceId: string;

  @ManyToOne(() => Rule, (rule) => rule.spaces)
  @JoinColumn()
  rule: Rule;

  @Column()
  @ApiProperty({ description: 'SpaceEvent ruleId in uuid' })
  ruleId: string;

  @Column()
  permissionRequestId: string;

  @ManyToOne(
    () => ExternalService,
    (externalService) => externalService.spaceEvents,
  )
  @JoinColumn()
  externalService: ExternalService;

  @Column()
  externalServiceId: string;

  @Column()
  @ApiProperty({
    description:
      'SpaceEvent status: pending|permission_requested|permission_approved|permission_rejected|running|closed|complete',
  })
  status: SpaceEventStatus;

  @Column()
  details: string;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  link: string;

  @Column()
  @ApiProperty({
    description: 'SpaceEvent duration in {number}{d|w|M|y|h|m|s} format',
  })
  @Matches(/^\d+[dwMyhms]$/, {
    message: 'SpaceEvent duration must in format: {number}{d|w|M|y|h|m|s}',
  })
  duration: string;

  @Column()
  @ApiProperty({ description: 'SpaceEvent start timestamp' })
  startsAt: Date;

  @Column()
  @ApiProperty({ description: 'SpaceEvent end timestamp' })
  endsAt: Date;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @Column()
  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;

  @OneToMany(
    () => PermissionRequest,
    (permissionRequest) => permissionRequest.space,
  )
  permissionRequests: PermissionRequest[];

  @OneToMany(
    () => SpaceEventImage,
    (spaceEventImage) => spaceEventImage.spaceEvent,
  )
  spaceEventImages: SpaceEventImage[];

  @ManyToMany(() => Topic, (topic) => topic.spaceEvents)
  @JoinTable({ name: 'space_event_topic' })
  topics: Topic;
}
