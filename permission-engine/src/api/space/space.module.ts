import { Module } from '@nestjs/common';
import { SpaceController } from './space.controller';
import { SpaceService } from './space.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Space } from 'src/database/entity/space.entity';
import { User } from 'src/database/entity/user.entity';
import { UserService } from '../user/user.service';
import { Rule } from 'src/database/entity/rule.entity';
import { RuleService } from '../rule/rule.service';
import { RuleBlock } from 'src/database/entity/rule-block.entity';
import { RuleBlockService } from '../rule-block/rule-block.service';
import { PermissionRequest } from 'src/database/entity/permission-request.entity';
import { PermissionRequestService } from '../permission-request/permission-request.service';
import { SpaceEvent } from 'src/database/entity/space-event.entity';
import { SpaceEventService } from '../space-event/space-event.service';
import { SpacePermissioner } from 'src/database/entity/space-permissioner.entity';
import { SpacePermissionerService } from '../space-permissioner/space-permissioner.service';
import { Logger } from 'src/lib/logger/logger.service';
import { S3Module } from 'src/lib/s3/s3.module';
import { S3Client } from '@aws-sdk/client-s3';
import { MulterModule } from '@nestjs/platform-express';
import configuration from 'src/config/configuration';
import { S3Service } from 'src/lib/s3/s3.service';
import multerS3 from 'multer-s3';
import { v4 as uuidv4 } from 'uuid';
import { SpaceImageService } from '../space-image/space-image.service';
import { SpaceImage } from 'src/database/entity/space-image.entity';
import { UserNotification } from 'src/database/entity/user-notification.entity';
import { PermissionResponse } from 'src/database/entity/permission-response.entity';
import { UserNotificationService } from '../user-notification/user-notification.service';
import { PermissionHandlerService } from 'src/lib/permission-handler/permission-handler.service';
import { PermissionHandlerModule } from 'src/lib/permission-handler/permission-handler.module';
import { SpaceEquipment } from 'src/database/entity/space-equipment.entity';
import { SpaceEquipmentService } from '../space-equipment/space-equipment.service';
import { Topic } from 'src/database/entity/topic.entity';
import { TopicService } from '../topic/topic.service';
import { SpaceTopic } from 'src/database/entity/space-topic.entity';
import { SpaceTopicService } from '../space-topic/space-topic.service';
import { SpaceHistory } from 'src/database/entity/space-history.entity';
import { SpaceHistoryService } from '../space-history/space-history.service';
import { SpaceHistoryImage } from 'src/database/entity/space-history-image.entity';
import { SpaceHistoryImageService } from '../space-history-image/space-history-image.service';
import { SpaceHistoryTaskImage } from 'src/database/entity/space-history-task-image.entity';
import { SpaceHistoryTask } from 'src/database/entity/space-history-task.entity';
import { SpaceHistoryTaskImageService } from '../space-history-task-image/space-history-task-image.service';
import { SpaceHistoryTaskService } from '../space-history-task/space-history-task.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    TypeOrmModule.forFeature([
      Space,
      SpaceEquipment,
      SpaceTopic,
      SpaceHistory,
      SpaceHistoryImage,
      SpaceHistoryTask,
      SpaceHistoryTaskImage,
      User,
      UserNotification,
      Rule,
      RuleBlock,
      PermissionRequest,
      PermissionResponse,
      SpaceEvent,
      SpacePermissioner,
      SpaceImage,
      Topic,
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
  controllers: [SpaceController],
  providers: [
    Logger,
    SpaceService,
    SpaceEquipmentService,
    SpaceTopicService,
    SpaceHistoryService,
    SpaceHistoryImageService,
    SpaceHistoryTaskService,
    SpaceHistoryTaskImageService,
    UserService,
    UserNotificationService,
    RuleService,
    RuleBlockService,
    PermissionRequestService,
    SpaceEventService,
    SpacePermissionerService,
    S3Service,
    SpaceImageService,
    TopicService,
    PermissionHandlerService,
  ],
})
export class SpaceModule {}
