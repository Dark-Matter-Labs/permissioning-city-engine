import { Module } from '@nestjs/common';
import { SpaceController } from './space.controller';
import { SpaceService } from './space.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Space } from 'src/database/entity/space.entity';
import { User } from 'src/database/entity/user.entity';
import { UserService } from '../user/user.service';
import { Rule } from 'src/database/entity/rule.entity';
import { RuleService } from '../rule/rule.service';
import { RuleBlock } from 'src/database/entity/rule-block.entity';
import { RuleBlockService } from '../rule-block/rule-block.service';
import { PermissionRequest } from 'src/database/entity/permission-request.entity';
import { PermissionRequestService } from '../permission-request/permission-request.service';
import { SpaceEvent } from 'src/database/entity/space-event.entity';
import { SpaceEventService } from '../space-event/space-event.service';
import { SpacePermissioner } from 'src/database/entity/space-permissioner.entity';
import { SpacePermissionerService } from '../space-permissioner/space-permissioner.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      Space,
      User,
      Rule,
      RuleBlock,
      PermissionRequest,
      SpaceEvent,
      SpacePermissioner,
    ]),
  ],
  controllers: [SpaceController],
  providers: [
    SpaceService,
    UserService,
    RuleService,
    RuleBlockService,
    PermissionRequestService,
    SpaceEventService,
    SpacePermissionerService,
  ],
})
export class SpaceModule {}
