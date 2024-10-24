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
import { SpaceService } from '../space/space.service';
import { Logger } from 'src/lib/logger/logger.service';
import configuration from 'src/config/configuration';
import { UserNotification } from 'src/database/entity/user-notification.entity';
import { PermissionResponse } from 'src/database/entity/permission-response.entity';
import { UserNotificationService } from '../user-notification/user-notification.service';
import { PermissionHandlerService } from 'src/lib/permission-handler/permission-handler.service';
import { PermissionHandlerModule } from 'src/lib/permission-handler/permission-handler.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    TypeOrmModule.forFeature([
      Space,
      User,
      UserNotification,
      Rule,
      SpacePermissioner,
      RuleBlock,
      PermissionRequest,
      PermissionResponse,
      SpaceEvent,
    ]),
    PermissionHandlerModule,
  ],
  controllers: [SpacePermissionerController],
  providers: [
    Logger,
    SpaceService,
    SpacePermissionerService,
    UserService,
    UserNotificationService,
    RuleService,
    RuleBlockService,
    PermissionRequestService,
    SpaceEventService,
    PermissionHandlerService,
  ],
})
export class SpacePermissionerModule {}
