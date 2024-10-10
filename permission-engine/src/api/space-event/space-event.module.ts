import { Module } from '@nestjs/common';
import { SpaceEventService } from './space-event.service';
import { SpaceEventController } from './space-event.controller';
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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SpaceEvent,
      User,
      PermissionRequest,
      Space,
      Rule,
      SpacePermissioner,
      RuleBlock,
    ]),
  ],
  controllers: [SpaceEventController],
  providers: [
    SpaceEventService,
    UserService,
    PermissionRequestService,
    SpaceService,
    RuleService,
    SpacePermissionerService,
    RuleBlockService,
  ],
})
export class SpaceEventModule {}
