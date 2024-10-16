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
import { SpaceEquipmentType } from 'src/lib/type';

@Entity()
export class SpaceEquipment {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'uuid' })
  id: string;

  @ManyToOne(() => Space, (space) => space.spaceEvents)
  @JoinColumn()
  space: Space;

  @Column()
  spaceId: string;

  @Column()
  @ApiProperty({ description: 'SpaceEquipment name in string' })
  name: string;

  @Column()
  @ApiProperty({
    description:
      'SpaceEquipment type: general|audio|video|lighting|stationery|furniture|sports|kitchen|craft|safty|computer|facility',
  })
  type: SpaceEquipmentType;

  @Column()
  @ApiProperty({ description: 'SpaceEquipment quantity in number' })
  quantity: number;

  @Column()
  @ApiProperty({ description: 'SpaceEquipment detail in string' })
  details: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @Column()
  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;
}
