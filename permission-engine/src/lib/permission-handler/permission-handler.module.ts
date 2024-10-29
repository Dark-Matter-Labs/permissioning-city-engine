import { forwardRef, Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PermissionHandlerProcessor } from './permission-handler.processor';
import { PermissionHandlerService } from './permission-handler.service';
import { Logger } from '../logger/logger.service';
import { ConfigModule } from '@nestjs/config';
import configuration from 'src/config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entity/user.entity';
import { UserService } from 'src/api/user/user.service';
import { UserNotification } from 'src/database/entity/user-notification.entity';
import { UserNotificationService } from 'src/api/user-notification/user-notification.service';
import { PermissionRequest } from 'src/database/entity/permission-request.entity';
import { PermissionResponse } from 'src/database/entity/permission-response.entity';
import { PermissionRequestService } from 'src/api/permission-request/permission-request.service';
import { PermissionResponseService } from 'src/api/permission-response/permission-response.service';
import { RuleService } from 'src/api/rule/rule.service';
import { SpaceEventService } from 'src/api/space-event/space-event.service';
import { SpacePermissionerService } from 'src/api/space-permissioner/space-permissioner.service';
import { SpaceService } from 'src/api/space/space.service';
import { Rule } from 'src/database/entity/rule.entity';
import { SpaceEvent } from 'src/database/entity/space-event.entity';
import { SpacePermissioner } from 'src/database/entity/space-permissioner.entity';
import { Space } from 'src/database/entity/space.entity';
import { RuleBlock } from 'src/database/entity/rule-block.entity';
import { RuleBlockService } from 'src/api/rule-block/rule-block.service';
import { PermissionRequestModule } from 'src/api/permission-request/permission-request.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    TypeOrmModule.forFeature([
      User,
      UserNotification,
      PermissionRequest,
      PermissionResponse,
      Space,
      SpaceEvent,
      SpacePermissioner,
      Rule,
      RuleBlock,
    ]),
    forwardRef(() => PermissionRequestModule),
    BullModule.registerQueue({
      name: 'permission-handler',
    }),
  ],
  providers: [
    PermissionHandlerProcessor,
    PermissionHandlerService,
    Logger,
    UserService,
    UserNotificationService,
    PermissionRequestService,
    PermissionResponseService,
    SpaceService,
    SpaceEventService,
    SpacePermissionerService,
    RuleService,
    RuleBlockService,
  ],
  exports: [PermissionHandlerService, BullModule],
})
export class PermissionHandlerModule {}