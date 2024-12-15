import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from '../user/user.service';
import { User } from 'src/database/entity/user.entity';
import { PermissionRequest } from 'src/database/entity/permission-request.entity';
import { PermissionRequestService } from '../permission-request/permission-request.service';
import { SpaceService } from '../space/space.service';
import { Space } from 'src/database/entity/space.entity';
import { Rule } from 'src/database/entity/rule.entity';
import { RuleService } from '../rule/rule.service';
import { SpacePermissioner } from 'src/database/entity/space-permissioner.entity';
import { SpacePermissionerService } from '../space-permissioner/space-permissioner.service';
import { RuleBlock } from 'src/database/entity/rule-block.entity';
import { RuleBlockService } from '../rule-block/rule-block.service';
import { Logger } from 'src/lib/logger/logger.service';
import { S3Service } from 'src/lib/s3/s3.service';
import { S3Module } from 'src/lib/s3/s3.module';
import { SpaceHistoryTaskImage } from 'src/database/entity/space-history-task-image.entity';
import { SpaceHistoryTask } from 'src/database/entity/space-history-task.entity';
import { SpaceHistoryTaskService } from '../space-history-task/space-history-task.service';
import { SpaceHistoryTaskImageService } from './space-history-task-image.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SpaceHistoryTaskImage,
      SpaceHistoryTask,
      User,
      PermissionRequest,
      Space,
      Rule,
      SpacePermissioner,
      RuleBlock,
    ]),
    S3Module,
  ],
  providers: [
    SpaceHistoryTaskImageService,
    SpaceHistoryTaskService,
    UserService,
    PermissionRequestService,
    SpaceService,
    RuleService,
    SpacePermissionerService,
    RuleBlockService,
    SpaceService,
    Logger,
    S3Service,
  ],
})
export class SpaceHistoryTaskImageModule {}
