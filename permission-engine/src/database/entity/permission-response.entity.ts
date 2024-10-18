import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { PermissionRequest } from './permission-request.entity';
import { SpacePermissioner } from './space-permissioner.entity';
import { PermissionResponseStatus } from 'src/lib/type';

@Entity()
export class PermissionResponse {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'uuid' })
  id: string;

  @ManyToOne(
    () => PermissionRequest,
    (permissionRequest) => permissionRequest.permissionResponses,
  )
  @JoinColumn()
  permissionRequest: PermissionRequest;

  @Column()
  @ApiProperty({
    description: 'PermissionReqponse permissionRequestId in uuid',
  })
  permissionRequestId: string;

  @ManyToOne(
    () => SpacePermissioner,
    (spacePermissioner) => spacePermissioner.permissionResponses,
  )
  @JoinColumn()
  spacePermissioner: SpacePermissioner;

  @Column()
  @ApiProperty({
    description: 'PermissionReqponse spacePermissionerId in uuid',
  })
  spacePermissionerId: string;

  @Column()
  @ApiProperty({ description: 'PermissionReqponse status' })
  status: PermissionResponseStatus;

  @Column('text', { array: true })
  @ApiProperty({ description: 'PermissionReqponse conditions' })
  conditions: string[];

  @Column('text', { array: true })
  @ApiProperty({ description: 'PermissionReqponse excitements' })
  excitements: string[];

  @Column('text', { array: true })
  @ApiProperty({ description: 'PermissionReqponse worries' })
  worries: string[];

  @Column()
  @ApiProperty({ description: 'Timeout timestamp' })
  timeoutAt: Date;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @Column()
  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;
}
