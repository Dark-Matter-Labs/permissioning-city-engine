import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserNotification } from './user-notification.entity';
import { SpaceEvent } from './space-event.entity';
import { ExternalService } from './external-service.entity';
import { RuleBlock } from './rule-block.entity';
import { Rule } from './rule.entity';
import { SpacePermissioner } from './space-permissioner.entity';
import { Topic } from './topic.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'uuid' })
  id: string;

  @Column()
  @ApiProperty({ description: 'User name in string' })
  name: string;

  @Column({ unique: true })
  @ApiProperty({ description: 'User email' })
  email: string;

  @Column({ default: true })
  @ApiProperty({ description: 'Is user active' })
  isActive: boolean;

  @Column({ default: true })
  @ApiProperty({ description: 'Does user subscribe emails' })
  isSubscribe: boolean;

  @Column({ default: 'individual' })
  @ApiProperty({
    description: 'User type: individual | organization | government',
  })
  type: 'individual' | 'organization' | 'government';

  @Column()
  @ApiProperty({ description: 'Year of birth in 4 digits' })
  birthYear: number;

  @Column()
  @ApiProperty({ description: 'Country' })
  country: string;

  @Column()
  @ApiProperty({ description: 'Region' })
  region: string;

  @Column()
  @ApiProperty({ description: 'City' })
  city: string;

  @Column()
  @ApiProperty({ description: 'District' })
  district: string;

  @Column()
  @ApiProperty({ description: 'Details' })
  details: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @Column()
  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;

  @OneToMany(
    () => UserNotification,
    (userNotification) => userNotification.user,
  )
  userNotifications: UserNotification[];

  @OneToMany(() => SpaceEvent, (spaceEvent) => spaceEvent.organizer)
  spaceEvents: SpaceEvent[];

  @OneToMany(() => ExternalService, (externalService) => externalService.owner)
  externalServices: ExternalService[];

  @OneToMany(() => Rule, (rule) => rule.author)
  rules: Rule[];

  @OneToMany(() => RuleBlock, (ruleBlock) => ruleBlock.author)
  ruleBlocks: RuleBlock[];

  @OneToMany(
    () => SpacePermissioner,
    (spacePermissioner) => spacePermissioner.user,
  )
  spacePermissioners: SpacePermissioner[];

  @OneToMany(
    () => SpacePermissioner,
    (spacePermissioner) => spacePermissioner.inviter,
  )
  spacePermissionerInviters: SpacePermissioner[];

  @ManyToMany(() => Topic, (topic) => topic.users)
  @JoinTable({ name: 'user_topic' })
  topics: Topic[];
}
