import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Space } from './space.entity';
import { SpaceImageType } from 'src/lib/type';

@Entity()
export class SpaceImage {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'uuid' })
  id: string;

  @ManyToOne(() => Space, (space) => space.spaceImages)
  @JoinColumn()
  space: Space;

  @Column()
  spaceId: string;

  @Column()
  link: string;

  @Column()
  type: SpaceImageType;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @Column()
  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;
}
