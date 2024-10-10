import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rule } from 'src/database/entity/rule.entity';
import { User } from 'src/database/entity/user.entity';
import { UserService } from '../user/user.service';
import { RuleBlockService } from './rule-block.service';
import { RuleBlock } from 'src/database/entity/rule-block.entity';
import { RuleBlockController } from './rule-block.controller';
import { Logger } from 'src/lib/logger/logger.service';
import { Space } from 'src/database/entity/space.entity';
import { SpaceService } from '../space/space.service';
import { PermissionRequest } from 'src/database/entity/permission-request.entity';
import { PermissionRequestService } from '../permission-request/permission-request.service';
import { SpaceEvent } from 'src/database/entity/space-event.entity';
import { SpaceEventService } from '../space-event/space-event.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      Rule,
      User,
      RuleBlock,
      Space,
      PermissionRequest,
      SpaceEvent,
    ]),
  ],
  controllers: [RuleBlockController],
  providers: [
    UserService,
    RuleBlockService,
    SpaceService,
    PermissionRequestService,
    SpaceEventService,
    Logger,
  ],
})
export class RuleBlockModule {}
