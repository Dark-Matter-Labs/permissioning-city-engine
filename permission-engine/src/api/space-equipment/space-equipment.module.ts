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
import { UserNotification } from 'src/database/entity/user-notification.entity';
import { PermissionResponse } from 'src/database/entity/permission-response.entity';
import { UserNotificationService } from '../user-notification/user-notification.service';
import { PermissionHandlerService } from 'src/lib/permission-handler/permission-handler.service';
import { ConfigModule } from '@nestjs/config';
import configuration from 'src/config/configuration';
import { PermissionHandlerModule } from 'src/lib/permission-handler/permission-handler.module';
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
      SpaceEquipment,
      SpaceEvent,
      SpaceTopic,
      User,
      UserNotification,
      PermissionRequest,
      PermissionResponse,
      Space,
      Rule,
      SpacePermissioner,
      RuleBlock,
      Topic,
    ]),
    PermissionHandlerModule,
  ],
  controllers: [SpaceEquipmentController],
  providers: [
    Logger,
    SpaceEquipmentService,
    SpaceEventService,
    SpaceTopicService,
    UserService,
    PermissionRequestService,
    SpaceService,
    RuleService,
    SpacePermissionerService,
    RuleBlockService,
    UserNotificationService,
    PermissionHandlerService,
    TopicService,
  ],
})
export class SpaceEquipmentModule {}
