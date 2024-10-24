import { Module } from '@nestjs/common';
import { SpaceEventService } from './space-event.service';
import { SpaceEventController } from './space-event.controller';
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
import { S3Service } from 'src/lib/s3/s3.service';
import { S3Module } from 'src/lib/s3/s3.module';
import { SpaceEventImage } from 'src/database/entity/space-event-image.entity';
import { SpaceEventImageService } from '../space-event-image/space-event-image.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from 'src/config/configuration';
import { MulterModule } from '@nestjs/platform-express';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
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
      SpaceEvent,
      SpaceEventImage,
      User,
      UserNotification,
      PermissionRequest,
      PermissionResponse,
      Space,
      Rule,
      SpacePermissioner,
      RuleBlock,
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
  controllers: [SpaceEventController],
  providers: [
    Logger,
    SpaceEventService,
    SpaceEventImageService,
    UserService,
    UserNotificationService,
    PermissionRequestService,
    SpaceService,
    RuleService,
    SpacePermissionerService,
    RuleBlockService,
    SpaceService,
    S3Service,
    PermissionHandlerService,
  ],
})
export class SpaceEventModule {}
