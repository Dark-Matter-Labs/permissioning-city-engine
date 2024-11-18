import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { SpaceEvent } from './space-event.entity';
import { User } from './user.entity';
import { Rule } from './rule.entity';
import { PermissionRequest } from './permission-request.entity';
import { SpacePermissioner } from './space-permissioner.entity';
import { SpaceImage } from './space-image.entity';
import { SpaceApprovedRule } from './space-approved-rule.entity';
import { SpaceTopic } from './space-topic.entity';
import { SpaceHistory } from './space-history.entity';

@Entity()
export class Space {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'uuid' })
  id: string;

  @Column()
  @ApiProperty({ description: 'Space name' })
  name: string;

  @ManyToOne(() => User, (user) => user.externalServices)
  @JoinColumn()
  owner: User;

  @Column()
  @ApiProperty({ description: 'Space owner userId in uuid' })
  ownerId: string;

  @Column()
  @ApiProperty({ description: 'Space zipcode' })
  zipcode: string;

  @Column()
  @ApiProperty({ description: 'Country' })
  country: string;

  @Column()
  @ApiProperty({ description: 'State|Region' })
  region: string;

  @Column()
  @ApiProperty({ description: 'City' })
  city: string;

  @Column()
  @ApiProperty({ description: 'District' })
  district: string;

  @Column()
  @ApiProperty({ description: 'Address' })
  address: string;

  @Column()
  @ApiProperty({ description: 'Latitude in string' })
  latitude: string;

  @Column()
  @ApiProperty({ description: 'Longitude in string' })
  longitude: string;

  @Column({ default: true })
  @ApiProperty({ description: 'Is space active' })
  isActive: boolean;

  @ManyToOne(() => Rule, (rule) => rule.spaces)
  @JoinColumn()
  rule: Rule;

  @Column()
  @ApiProperty({ description: 'Space rule ruleId in uuid' })
  ruleId: string;

  @Column()
  @ApiProperty({ description: 'Space description' })
  details: string;

  @Column()
  @ApiProperty({ description: 'Space external link' })
  link: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @Column()
  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;

  @OneToMany(() => SpaceImage, (spaceImage) => spaceImage.space)
  spaceImages: SpaceImage[];

  @OneToMany(() => SpaceTopic, (spaceTopic) => spaceTopic.space)
  spaceTopics: SpaceTopic[];

  @OneToMany(
    () => SpaceApprovedRule,
    (spaceApprovedRule) => spaceApprovedRule.space,
  )
  spaceApprovedRules: SpaceApprovedRule[];

  @OneToMany(() => SpaceEvent, (spaceEvent) => spaceEvent.space)
  spaceEvents: SpaceEvent[];

  @OneToMany(
    () => PermissionRequest,
    (permissionRequest) => permissionRequest.space,
  )
  permissionRequests: PermissionRequest[];

  @OneToMany(
    () => SpacePermissioner,
    (SpacePermissioner) => SpacePermissioner.space,
  )
  spacePermissioners: SpacePermissioner[];

  @OneToMany(() => SpaceHistory, (spaceHistory) => spaceHistory.space)
  spaceHistories: SpaceHistory[];
}
