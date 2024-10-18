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
import { PermissionResponse } from './permission-response.entity';

@Entity()
export class SpacePermissioner {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'uuid' })
  id: string;

  @ManyToOne(() => Space, (space) => space.spacePermissioners)
  @JoinColumn()
  space: Space;

  @Column()
  @ApiProperty({ description: 'SpacePermissioner spaceId in uuid' })
  spaceId: string;

  @ManyToOne(() => User, (user) => user.spacePermissioners)
  @JoinColumn()
  user: User;

  @Column()
  @ApiProperty({ description: 'SpacePermissioner userId in uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.spacePermissionerInviters)
  @JoinColumn()
  inviter: User;

  @Column()
  @ApiProperty({ description: 'SpacePermissioner inviterId in uuid' })
  inviterId: string;

  @Column({ default: false })
  isActive: boolean;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @Column()
  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;

  @OneToMany(
    () => PermissionResponse,
    (permissionResponse) => permissionResponse.spacePermissioner,
  )
  permissionResponses: PermissionResponse[];
}
