import { forwardRef, Module } from '@nestjs/common';
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
import { Logger } from 'src/lib/logger/logger.service';
import { UserNotification } from 'src/database/entity/user-notification.entity';
import { PermissionResponseService } from '../permission-response/permission-response.service';
import { PermissionResponse } from 'src/database/entity/permission-response.entity';
import { UserNotificationService } from '../user-notification/user-notification.service';
import { PermissionHandlerService } from 'src/lib/permission-handler/permission-handler.service';
import { ConfigModule } from '@nestjs/config';
import configuration from 'src/config/configuration';
import { PermissionHandlerModule } from 'src/lib/permission-handler/permission-handler.module';
import { SpaceEquipment } from 'src/database/entity/space-equipment.entity';
import { SpaceEquipmentService } from '../space-equipment/space-equipment.service';
import { SpaceTopic } from 'src/database/entity/space-topic.entity';
import { SpaceTopicService } from '../space-topic/space-topic.service';
import { Topic } from 'src/database/entity/topic.entity';
import { TopicService } from '../topic/topic.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    TypeOrmModule.forFeature([
      PermissionRequest,
      PermissionResponse,
      Space,
      SpaceEvent,
      SpaceEquipment,
      SpaceTopic,
      User,
      UserNotification,
      Rule,
      RuleBlock,
      SpacePermissioner,
      Topic,
    ]),
    forwardRef(() => PermissionHandlerModule),
  ],
  controllers: [PermissionRequestController],
  providers: [
    Logger,
    PermissionRequestService,
    PermissionHandlerService,
    PermissionResponseService,
    SpaceService,
    SpaceEventService,
    SpaceEquipmentService,
    SpaceTopicService,
    UserService,
    UserNotificationService,
    RuleService,
    RuleBlockService,
    SpacePermissionerService,
    TopicService,
  ],
})
export class PermissionRequestModule {}
