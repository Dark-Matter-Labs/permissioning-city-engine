import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Space } from 'src/database/entity/space.entity';
import { UserService } from '../user/user.service';
import { User } from 'src/database/entity/user.entity';
import { PermissionRequest } from 'src/database/entity/permission-request.entity';
import { PermissionRequestService } from '../permission-request/permission-request.service';
import { SpaceService } from '../space/space.service';
import { Rule } from 'src/database/entity/rule.entity';
import { RuleService } from '../rule/rule.service';
import { SpacePermissioner } from 'src/database/entity/space-permissioner.entity';
import { SpacePermissionerService } from '../space-permissioner/space-permissioner.service';
import { RuleBlock } from 'src/database/entity/rule-block.entity';
import { RuleBlockService } from '../rule-block/rule-block.service';
import { Logger } from 'src/lib/logger/logger.service';
import { S3Service } from 'src/lib/s3/s3.service';
import { S3Module } from 'src/lib/s3/s3.module';
import { SpaceImage } from 'src/database/entity/space-image.entity';
import { SpaceImageService } from './space-image.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SpaceImage,
      Space,
      User,
      PermissionRequest,
      Space,
      Rule,
      SpacePermissioner,
      RuleBlock,
    ]),
    S3Module,
  ],
  providers: [
    SpaceImageService,
    SpaceService,
    UserService,
    PermissionRequestService,
    RuleService,
    SpacePermissionerService,
    RuleBlockService,
    Logger,
    S3Service,
  ],
})
export class SpaceImageModule {}
