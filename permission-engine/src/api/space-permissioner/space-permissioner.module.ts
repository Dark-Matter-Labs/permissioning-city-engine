import { Module } from '@nestjs/common';
import { SpacePermissionerController } from './space-permissioner.controller';
import { SpacePermissionerService } from './space-permissioner.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Space } from 'src/database/entity/space.entity';
import { User } from 'src/database/entity/user.entity';
import { UserService } from '../user/user.service';
import { Rule } from 'src/database/entity/rule.entity';
import { RuleService } from '../rule/rule.service';
import { SpacePermissioner } from 'src/database/entity/space-permissioner.entity';
import { RuleBlock } from 'src/database/entity/rule-block.entity';
import { RuleBlockService } from '../rule-block/rule-block.service';
import { PermissionRequest } from 'src/database/entity/permission-request.entity';
import { PermissionRequestService } from '../permission-request/permission-request.service';
import { SpaceEvent } from 'src/database/entity/space-event.entity';
import { SpaceEventService } from '../space-event/space-event.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      Space,
      User,
      Rule,
      SpacePermissioner,
      RuleBlock,
      PermissionRequest,
      SpaceEvent,
    ]),
  ],
  controllers: [SpacePermissionerController],
  providers: [
    SpacePermissionerService,
    UserService,
    RuleService,
    RuleBlockService,
    PermissionRequestService,
    SpaceEventService,
  ],
})
export class SpacePermissionerModule {}
