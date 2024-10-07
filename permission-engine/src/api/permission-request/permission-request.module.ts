import { Module } from '@nestjs/common';
import { PermissionRequestService } from './permission-request.service';
import { PermissionRequestController } from './permission-request.controller';
import { PermissionRequest } from 'src/database/entity/permission-request.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([PermissionRequest])],
  controllers: [PermissionRequestController],
  providers: [PermissionRequestService],
})
export class PermissionRequestModule {}
