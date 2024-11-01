import { Module } from '@nestjs/common';
import { TopicController } from './topic.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Topic } from 'src/database/entity/topic.entity';
import { TopicService } from './topic.service';

import { User } from 'src/database/entity/user.entity';
import { UserService } from '../user/user.service';
import { RuleBlock } from 'src/database/entity/rule-block.entity';
import { Logger } from 'src/lib/logger/logger.service';
import { Space } from 'src/database/entity/space.entity';
import { SpaceService } from '../space/space.service';
import { PermissionRequest } from 'src/database/entity/permission-request.entity';
import { PermissionRequestService } from '../permission-request/permission-request.service';
import { SpaceEvent } from 'src/database/entity/space-event.entity';
import { SpaceEventService } from '../space-event/space-event.service';
import { SpacePermissioner } from 'src/database/entity/space-permissioner.entity';
import { SpacePermissionerService } from '../space-permissioner/space-permissioner.service';
import configuration from 'src/config/configuration';
import { UserNotification } from 'src/database/entity/user-notification.entity';
import { PermissionResponse } from 'src/database/entity/permission-response.entity';
import { UserNotificationService } from '../user-notification/user-notification.service';
import { PermissionHandlerService } from 'src/lib/permission-handler/permission-handler.service';
import { PermissionHandlerModule } from 'src/lib/permission-handler/permission-handler.module';
import { Rule } from 'src/database/entity/rule.entity';
import { RuleService } from '../rule/rule.service';
import { SpaceTopic } from 'src/database/entity/space-topic.entity';
import { SpaceTopicService } from '../space-topic/space-topic.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    TypeOrmModule.forFeature([
      Topic,
      User,
      UserNotification,
      Rule,
      RuleBlock,
      Space,
      SpaceTopic,
      PermissionRequest,
      PermissionResponse,
      SpaceEvent,
      SpacePermissioner,
    ]),
    PermissionHandlerModule,
  ],
  controllers: [TopicController],
  providers: [
    Logger,
    TopicService,
    UserService,
    UserNotificationService,
    SpaceService,
    SpaceTopicService,
    RuleService,
    PermissionRequestService,
    SpaceEventService,
    SpacePermissionerService,
    PermissionHandlerService,
  ],
})
export class TopicModule {}
