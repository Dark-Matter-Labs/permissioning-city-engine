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
import { SpaceHistoryImage } from 'src/database/entity/space-history-image.entity';
import { SpaceHistoryService } from '../space-history/space-history.service';
import { SpaceHistoryImageService } from './space-history-image.service';
import { SpaceHistory } from 'src/database/entity/space-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SpaceHistoryImage,
      SpaceHistory,
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
    SpaceHistoryImageService,
    SpaceHistoryService,
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
export class SpaceHistoryImageModule {}
