import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpaceEvent } from 'src/database/entity/space-event.entity';
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
import { SpaceEventImage } from 'src/database/entity/space-event-image.entity';
import { SpaceEventImageService } from './space-event-image.service';
import { SpaceEventService } from '../space-event/space-event.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SpaceEventImage,
      SpaceEvent,
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
    SpaceEventImageService,
    SpaceEventService,
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
export class SpaceEventImageModule {}
