import { Module } from '@nestjs/common';
import { RuleController } from './rule.controller';
import { RuleService } from './rule.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rule } from 'src/database/entity/rule.entity';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    TypeOrmModule.forFeature([
      Rule,
      User,
      UserNotification,
      RuleBlock,
      Space,
      PermissionRequest,
      PermissionResponse,
      SpaceEvent,
      SpacePermissioner,
    ]),
    PermissionHandlerModule,
  ],
  controllers: [RuleController],
  providers: [
    Logger,
    RuleService,
    UserService,
    UserNotificationService,
    SpaceService,
    PermissionRequestService,
    SpaceEventService,
    SpacePermissionerService,
    PermissionHandlerService,
  ],
})
export class RuleModule {}
