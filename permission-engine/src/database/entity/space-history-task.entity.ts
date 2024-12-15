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
import { Space } from './space.entity';
import { User } from './user.entity';
import { SpaceHistory } from './space-history.entity';
import { SpaceHistoryTaskImage } from './space-history-task-image.entity';
import { SpaceHistoryTaskStatus } from 'src/lib/type';

@Entity()
export class SpaceHistoryTask {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'uuid' })
  id: string;

  @ManyToOne(() => Space, (space) => space.spaceHistories)
  @JoinColumn()
  space: Space;

  @Column()
  @ApiProperty({ description: 'SpaceHistory spaceId in uuid' })
  spaceId: string;

  @ManyToOne(() => User, (user) => user.spaceHistoryTaskCreators)
  @JoinColumn()
  creator: User;

  @Column()
  @ApiProperty({ description: 'SpaceHistory creatorId in uuid' })
  creatorId: string;

  @ManyToOne(() => User, (user) => user.spaceHistoryTaskResolvers)
  @JoinColumn()
  resolver: User;

  @Column()
  @ApiProperty({ description: 'SpaceHistory resolverId in uuid' })
  resolverId: string;

  @ManyToOne(
    () => SpaceHistory,
    (spaceHistory) => spaceHistory.spaceHistoryTasks,
  )
  @JoinColumn()
  spaceHistory: SpaceHistory;

  @Column()
  @ApiProperty({ description: 'SpaceHistory spaceId in uuid' })
  spaceHistoryId: string;

  @Column()
  @ApiProperty({
    description: 'SpaceEvent status: pending|resolved',
  })
  status: SpaceHistoryTaskStatus;

  @Column()
  @ApiProperty({ description: 'SpaceHistory title' })
  title: string;

  @Column()
  @ApiProperty({ description: 'SpaceHistory description' })
  details: string;

  @OneToMany(
    () => SpaceHistoryTaskImage,
    (spaceHistoryTaskImage) => spaceHistoryTaskImage.spaceHistoryTask,
  )
  spaceHistoryTaskImages: SpaceHistoryTaskImage[];

  @CreateDateColumn()
  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @CreateDateColumn()
  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;
}
