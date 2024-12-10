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
import { SpaceHistory } from 'src/database/entity/space-history.entity';
import { SpaceHistoryService } from './space-history.service';
import { SpaceHistoryController } from './space-history.controller';
import { SpaceTopic } from 'src/database/entity/space-topic.entity';
import { SpaceTopicService } from '../space-topic/space-topic.service';
import { UserNotification } from 'src/database/entity/user-notification.entity';
import { UserNotificationService } from '../user-notification/user-notification.service';
import { SpaceEvent } from 'src/database/entity/space-event.entity';
import { SpaceEventService } from '../space-event/space-event.service';
import { SpaceEquipment } from 'src/database/entity/space-equipment.entity';
import { SpaceEquipmentService } from '../space-equipment/space-equipment.service';
import { Topic } from 'src/database/entity/topic.entity';
import { TopicService } from '../topic/topic.service';
import { S3Client } from '@aws-sdk/client-s3';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import multerS3 from 'multer-s3';
import { v4 as uuidv4 } from 'uuid';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SpaceHistory,
      Space,
      SpaceTopic,
      User,
      UserNotification,
      PermissionRequest,
      SpaceEvent,
      Rule,
      RuleBlock,
      SpacePermissioner,
      SpaceEquipment,
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
  ],
  controllers: [SpaceHistoryController],
  providers: [
    Logger,
    SpaceHistoryService,
    SpaceService,
    SpaceTopicService,
    UserService,
    UserNotificationService,
    PermissionRequestService,
    RuleService,
    SpaceEventService,
    SpacePermissionerService,
    SpaceEquipmentService,
    RuleBlockService,
    TopicService,
  ],
})
export class SpaceHistoryModule {}
