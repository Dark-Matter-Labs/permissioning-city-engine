import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { SpacePermissioner } from 'src/database/entity/space-permissioner.entity';
import { SpacePermissionerService } from '../space-permissioner/space-permissioner.service';
import { UserNotification } from 'src/database/entity/user-notification.entity';
import { PermissionResponse } from 'src/database/entity/permission-response.entity';
import { UserNotificationService } from '../user-notification/user-notification.service';
import { PermissionHandlerService } from 'src/lib/permission-handler/permission-handler.service';
import { PermissionHandlerModule } from 'src/lib/permission-handler/permission-handler.module';
import { S3Client } from '@aws-sdk/client-s3';
import { MulterModule } from '@nestjs/platform-express';
import { S3Module } from 'src/lib/s3/s3.module';
import multerS3 from 'multer-s3';
import { v4 as uuidv4 } from 'uuid';
import { SpaceEquipmentService } from '../space-equipment/space-equipment.service';
import { SpaceEquipment } from 'src/database/entity/space-equipment.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      Rule,
      User,
      UserNotification,
      RuleBlock,
      Space,
      PermissionRequest,
      PermissionResponse,
      SpaceEvent,
      SpaceEquipment,
      SpacePermissioner,
    ]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        storage: multerS3({
          s3: new S3Client({
            credentials: {
              accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
              secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
            },
            region: configService.get('AWS_REGION'),
          }),
          bucket: configService.get('AWS_S3_BUCKET_NAME'),
          key: (req, file, cb) => {
            cb(null, `${uuidv4()}_${file.originalname}`);
          },
        }),
      }),
    }),
    S3Module,
    PermissionHandlerModule,
  ],
  controllers: [RuleBlockController],
  providers: [
    Logger,
    UserService,
    UserNotificationService,
    RuleBlockService,
    SpaceService,
    PermissionRequestService,
    SpaceEventService,
    SpaceEquipmentService,
    SpacePermissionerService,
    PermissionHandlerService,
  ],
})
export class RuleBlockModule {}
