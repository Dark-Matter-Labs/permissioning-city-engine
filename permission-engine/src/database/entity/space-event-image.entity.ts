import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { SpaceEvent } from './space-event.entity';

@Entity()
export class SpaceEventImage {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'uuid' })
  id: string;

  @ManyToOne(() => SpaceEvent, (spaceEvent) => spaceEvent.spaceEventImages)
  @JoinColumn()
  spaceEvent: SpaceEvent;

  @Column()
  spaceEventId: string;

  @Column()
  link: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @Column()
  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;
}
