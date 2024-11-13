import { forwardRef, Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NotificationHandlerProcessor } from './notification-handler.processor';
import { NotificationHandlerService } from './notification-handler.service';
import { Logger } from '../logger/logger.service';
import { SESService } from '../ses/ses.service';
import { SESModule } from '../ses/ses.module';
import { ConfigModule } from '@nestjs/config';
import configuration from 'src/config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entity/user.entity';
import { UserService } from 'src/api/user/user.service';
import { UserNotification } from 'src/database/entity/user-notification.entity';
import { UserNotificationService } from 'src/api/user-notification/user-notification.service';
import { UserNotificationModule } from 'src/api/user-notification/user-notification.module';
import { SpaceEvent } from 'src/database/entity/space-event.entity';
import { SpaceEventService } from 'src/api/space-event/space-event.service';
import { WsNotificationGateway } from '../ws-notification/ws-notification.gateway';
import { JwtService } from '@nestjs/jwt';
import { PermissionRequest } from 'src/database/entity/permission-request.entity';
import { PermissionRequestService } from 'src/api/permission-request/permission-request.service';
import { RuleService } from 'src/api/rule/rule.service';
import { Rule } from 'src/database/entity/rule.entity';
import { Space } from 'src/database/entity/space.entity';
import { SpaceService } from 'src/api/space/space.service';
import { SpacePermissioner } from 'src/database/entity/space-permissioner.entity';
import { SpacePermissionerService } from 'src/api/space-permissioner/space-permissioner.service';
import { SpaceTopic } from 'src/database/entity/space-topic.entity';
import { SpaceTopicService } from 'src/api/space-topic/space-topic.service';
import { RuleBlock } from 'src/database/entity/rule-block.entity';
import { RuleBlockService } from 'src/api/rule-block/rule-block.service';
import { SpaceEquipment } from 'src/database/entity/space-equipment.entity';
import { SpaceEquipmentService } from 'src/api/space-equipment/space-equipment.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    TypeOrmModule.forFeature([
      User,
      UserNotification,
      SpaceEvent,
      PermissionRequest,
      Rule,
      RuleBlock,
      Space,
      SpacePermissioner,
      SpaceEquipment,
      SpaceTopic,
    ]),
    BullModule.registerQueue({
      name: 'notification-handler',
    }),
    forwardRef(() => UserNotificationModule),
    SESModule,
  ],
  providers: [
    NotificationHandlerProcessor,
    NotificationHandlerService,
    SESService,
    Logger,
    JwtService,
    UserService,
    UserNotificationService,
    SpaceEventService,
    SpaceService,
    SpacePermissionerService,
    SpaceTopicService,
    SpaceEquipmentService,
    PermissionRequestService,
    RuleService,
    RuleBlockService,
    WsNotificationGateway,
  ],
  exports: [NotificationHandlerService],
})
export class NotificationHandlerModule {}
