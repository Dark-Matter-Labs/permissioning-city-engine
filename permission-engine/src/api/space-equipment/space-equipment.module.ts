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
import { SpaceEquipment } from 'src/database/entity/space-equipment.entity';
import { SpaceEventService } from '../space-event/space-event.service';
import { SpaceEquipmentService } from './space-equipment.service';
import { SpaceEquipmentController } from './space-equipment.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SpaceEquipment,
      SpaceEvent,
      User,
      PermissionRequest,
      Space,
      Rule,
      SpacePermissioner,
      RuleBlock,
    ]),
  ],
  controllers: [SpaceEquipmentController],
  providers: [
    SpaceEquipmentService,
    SpaceEventService,
    UserService,
    PermissionRequestService,
    SpaceService,
    RuleService,
    SpacePermissionerService,
    RuleBlockService,
    SpaceService,
    Logger,
  ],
})
export class SpaceEquipmentModule {}
