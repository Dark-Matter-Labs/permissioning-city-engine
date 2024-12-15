import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { SpaceHistory } from './space-history.entity';

@Entity()
export class SpaceHistoryImage {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'uuid' })
  id: string;

  @ManyToOne(
    () => SpaceHistory,
    (spaceHistory) => spaceHistory.spaceHistoryImages,
  )
  @JoinColumn()
  spaceHistory: SpaceHistory;

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
