import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class ExternalService {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'uuid' })
  id: string;

  @Column()
  @ApiProperty({ description: 'External service name' })
  name: string;

  @ManyToOne(() => User, (user) => user.externalServices)
  @JoinColumn()
  owner: User;

  @Column()
  @ApiProperty({ description: 'External service owner userId in uuid' })
  ownerId: string;

  @Column()
  @ApiProperty({ description: 'External service link' })
  link: string;

  @Column({ default: true })
  @ApiProperty({ description: 'Is space active' })
  isActive: boolean;

  @Column()
  @ApiProperty({ description: 'External service description' })
  details: string;

  @Column()
  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @Column()
  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;
}
