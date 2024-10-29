import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpaceEvent } from 'src/database/entity/space-event.entity';
import { User } from 'src/database/entity/user.entity';
import { PermissionRequest } from 'src/database/entity/permission-request.entity';
import { Space } from 'src/database/entity/space.entity';
import { Rule } from 'src/database/entity/rule.entity';
import { SpacePermissioner } from 'src/database/entity/space-permissioner.entity';
import { RuleBlock } from 'src/database/entity/rule-block.entity';
import { Logger } from 'src/lib/logger/logger.service';
import { SpaceEquipment } from 'src/database/entity/space-equipment.entity';
import { UserNotification } from 'src/database/entity/user-notification.entity';
import { PermissionResponse } from 'src/database/entity/permission-response.entity';
import { ConfigModule } from '@nestjs/config';
import configuration from 'src/config/configuration';
import { MockupService } from './mockup.service';
import { SpaceImage } from 'src/database/entity/space-image.entity';
import { SpaceEventImage } from 'src/database/entity/space-event-image.entity';
import { PermissionResponseService } from 'src/api/permission-response/permission-response.service';
import { SpaceEventImageService } from 'src/api/space-event-image/space-event-image.service';
import { SpaceImageService } from 'src/api/space-image/space-image.service';
import { UserService } from 'src/api/user/user.service';
import { PermissionRequestService } from 'src/api/permission-request/permission-request.service';
import { RuleBlockService } from 'src/api/rule-block/rule-block.service';
import { RuleService } from 'src/api/rule/rule.service';
import { SpaceEquipmentService } from 'src/api/space-equipment/space-equipment.service';
import { SpaceEventService } from 'src/api/space-event/space-event.service';
import { SpacePermissionerService } from 'src/api/space-permissioner/space-permissioner.service';
import { SpaceService } from 'src/api/space/space.service';
import { UserNotificationService } from 'src/api/user-notification/user-notification.service';
import { SpaceApprovedRuleService } from 'src/api/space-approved-rule/space-approved-rule.service';
import { SpaceApprovedRule } from 'src/database/entity/space-approved-rule.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    TypeOrmModule.forFeature([
      User,
      UserNotification,
      Space,
      SpaceApprovedRule,
      SpaceImage,
      SpaceEvent,
      SpaceEventImage,
      SpaceEquipment,
      SpacePermissioner,
      PermissionRequest,
      PermissionResponse,
      Rule,
      RuleBlock,
    ]),
  ],
  providers: [
    Logger,
    MockupService,
    UserService,
    UserNotificationService,
    SpaceService,
    SpaceApprovedRuleService,
    SpaceImageService,
    SpaceEventService,
    SpaceEventImageService,
    SpaceEquipmentService,
    SpacePermissionerService,
    PermissionRequestService,
    PermissionResponseService,
    RuleService,
    RuleBlockService,
  ],
  exports: [MockupService],
})
export class MockupModule {}
