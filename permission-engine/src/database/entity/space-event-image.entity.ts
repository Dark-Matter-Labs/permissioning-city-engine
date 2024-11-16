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
import { SpaceEventImageType } from 'src/lib/type';

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

  @Column()
  type: SpaceEventImageType;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @Column()
  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;
}
