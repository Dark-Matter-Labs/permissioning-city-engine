import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { SpaceHistoryTask } from './space-history-task.entity';

@Entity()
export class SpaceHistoryTaskImage {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'uuid' })
  id: string;

  @ManyToOne(
    () => SpaceHistoryTask,
    (spaceHistoryTask) => spaceHistoryTask.spaceHistoryTaskImages,
  )
  @JoinColumn()
  spaceHistoryTask: SpaceHistoryTask;

  @Column()
  spaceHistoryId: string;

  @Column()
  link: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @Column()
  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;
}
