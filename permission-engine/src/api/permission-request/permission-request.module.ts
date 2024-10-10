import { Module } from '@nestjs/common';
import { PermissionRequestService } from './permission-request.service';
import { PermissionRequestController } from './permission-request.controller';
import { PermissionRequest } from 'src/database/entity/permission-request.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpaceService } from '../space/space.service';
import { Space } from 'src/database/entity/space.entity';
import { SpaceEvent } from 'src/database/entity/space-event.entity';
import { SpaceEventService } from '../space-event/space-event.service';
import { UserService } from '../user/user.service';
import { User } from 'src/database/entity/user.entity';
import { Rule } from 'src/database/entity/rule.entity';
import { RuleService } from '../rule/rule.service';
import { RuleBlock } from 'src/database/entity/rule-block.entity';
import { RuleBlockService } from '../rule-block/rule-block.service';
import { SpacePermissioner } from 'src/database/entity/space-permissioner.entity';
import { SpacePermissionerService } from '../space-permissioner/space-permissioner.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PermissionRequest,
      Space,
      SpaceEvent,
      User,
      Rule,
      RuleBlock,
      SpacePermissioner,
    ]),
  ],
  controllers: [PermissionRequestController],
  providers: [
    PermissionRequestService,
    SpaceService,
    SpaceEventService,
    UserService,
    RuleService,
    RuleBlockService,
    SpacePermissionerService,
  ],
})
export class PermissionRequestModule {}
