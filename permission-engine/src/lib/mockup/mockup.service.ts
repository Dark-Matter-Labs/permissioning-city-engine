import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Pool, PoolClient } from 'pg';
import { PermissionRequestService } from 'src/api/permission-request/permission-request.service';
import { PermissionResponseService } from 'src/api/permission-response/permission-response.service';
import { RuleBlockService } from 'src/api/rule-block/rule-block.service';
import { RuleService } from 'src/api/rule/rule.service';
import { SpaceEquipmentService } from 'src/api/space-equipment/space-equipment.service';
import { SpaceEventImageService } from 'src/api/space-event-image/space-event-image.service';
import { SpaceEventService } from 'src/api/space-event/space-event.service';
import { SpaceImageService } from 'src/api/space-image/space-image.service';
import { SpacePermissionerService } from 'src/api/space-permissioner/space-permissioner.service';
import { SpaceService } from 'src/api/space/space.service';
import { UserNotificationService } from 'src/api/user-notification/user-notification.service';
import { UserService } from 'src/api/user/user.service';
import { DatabaseConfig } from 'src/database/database.service';
import { PermissionRequest } from 'src/database/entity/permission-request.entity';
import { PermissionResponse } from 'src/database/entity/permission-response.entity';
import { RuleBlock } from 'src/database/entity/rule-block.entity';
import { Rule } from 'src/database/entity/rule.entity';
import { SpaceEquipment } from 'src/database/entity/space-equipment.entity';
import { SpaceEventImage } from 'src/database/entity/space-event-image.entity';
import { SpaceEvent } from 'src/database/entity/space-event.entity';
import { SpaceImage } from 'src/database/entity/space-image.entity';
import { SpacePermissioner } from 'src/database/entity/space-permissioner.entity';
import { Space } from 'src/database/entity/space.entity';
import { Logger } from 'src/lib/logger/logger.service';
import { DataSource, Repository } from 'typeorm';
import { UserNotification } from 'src/database/entity/user-notification.entity';
import { User } from 'src/database/entity/user.entity';
import { mockup } from './mockup';
import {
  RuleBlockContentDivider,
  RuleBlockType,
  RuleTarget,
  SpaceImageType,
} from 'src/lib/type';
import { SpaceApprovedRuleService } from 'src/api/space-approved-rule/space-approved-rule.service';
import { TopicService } from 'src/api/topic/topic.service';
import dayjs from 'dayjs';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { SpaceHistory } from 'src/database/entity/space-history.entity';
import { SpaceTopic } from 'src/database/entity/space-topic.entity';
import { SpaceApprovedRule } from 'src/database/entity/space-approved-rule.entity';

@Injectable()
export class MockupService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  private client: PoolClient;
  private prefix: string = 'test';

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserNotification)
    private userNotificationRepository: Repository<UserNotification>,
    @InjectRepository(Space)
    private spaceRepository: Repository<Space>,
    @InjectRepository(SpaceImage)
    private spaceImageRepository: Repository<SpaceImage>,
    @InjectRepository(SpaceHistory)
    private spaceHistoryRepository: Repository<SpaceHistory>,
    @InjectRepository(SpaceTopic)
    private spaceTopicRepository: Repository<SpaceTopic>,
    @InjectRepository(SpaceEquipment)
    private spaceEquipmentRepository: Repository<SpaceEquipment>,
    @InjectRepository(SpaceApprovedRule)
    private spaceApprovedRuleRepository: Repository<SpaceApprovedRule>,
    @InjectRepository(SpaceEvent)
    private spaceEventRepository: Repository<SpaceEvent>,
    @InjectRepository(SpaceEventImage)
    private spaceEventImageRepository: Repository<SpaceEventImage>,
    @InjectRepository(SpacePermissioner)
    private spacePermissionerRepository: Repository<SpacePermissioner>,
    @InjectRepository(PermissionRequest)
    private permissionRequestRepository: Repository<PermissionRequest>,
    @InjectRepository(PermissionResponse)
    private permissionResponseRepository: Repository<PermissionResponse>,
    @InjectRepository(Rule)
    private ruleRepository: Repository<Rule>,
    @InjectRepository(RuleBlock)
    private ruleBlockRepository: Repository<RuleBlock>,
    private readonly userService: UserService,
    private readonly userNotificationService: UserNotificationService,
    private readonly spaceService: SpaceService,
    private readonly spaceApprovedRuleService: SpaceApprovedRuleService,
    private readonly spaceImageService: SpaceImageService,
    private readonly spaceEventService: SpaceEventService,
    private readonly spaceEventImageService: SpaceEventImageService,
    private readonly spaceEquipmentService: SpaceEquipmentService,
    private readonly spacePermissionerService: SpacePermissionerService,
    private readonly permissionRequestService: PermissionRequestService,
    private readonly permissionResponseService: PermissionResponseService,
    private readonly ruleService: RuleService,
    private readonly ruleBlockService: RuleBlockService,
    private readonly topicService: TopicService,
    private readonly logger: Logger,
  ) {
    this.pool = new Pool(this.configService.get<DatabaseConfig>('database'));
  }

  async onModuleInit() {
    if (!this.client) {
      this.client = await this.pool.connect();
    }

    if (
      process.env.MOCKUP_DATA !== 'true' &&
      process.env.NODE_ENV === 'dev' &&
      process.env.ENGINE_MODE === 'api'
    ) {
      await this.down();
      await this.up();
    }

    if (
      process.env.MOCKUP_DATA === 'true' &&
      process.env.ENGINE_MODE === 'api'
    ) {
      const {
        rows: [migration],
      } = await this.client.query(
        `SELECT * FROM migration WHERE name LIKE '%insert-workshop-data.sql' AND is_successful = true LIMIT 1`,
      );

      if (
        migration &&
        dayjs(migration.created_at).toString() !==
          dayjs(migration.updated_at).toString()
      ) {
        // comented this out for mock-up-and-down by restart feature
        // return;
      }

      await this.down();
      await this.downProd();
      await this.upProd();
    }
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.release();
    }
  }

  async down() {
    try {
      await this.client.query('BEGIN');
      // Select test sets
      // user
      const users = await this.userRepository.query(
        `SELECT * FROM "user" WHERE name LIKE 'test%'`,
      );
      // userNotification
      const userNotifications = await this.userNotificationRepository.query(
        `SELECT * FROM "user_notification" WHERE user_id = ANY($1)`,
        [users.map((item) => item.id)],
      );
      // rule
      const rules = await this.ruleRepository.query(
        `SELECT * FROM "rule" WHERE name LIKE 'test%'`,
      );
      // ruleBlock
      const ruleBlockIds = await this.ruleBlockRepository.query(
        `SELECT rule_block_id FROM "rule_rule_block" WHERE rule_id = ANY($1)`,
        [rules.map((item) => item.id)],
      );
      const ruleBlocks = await this.ruleBlockRepository.query(
        `SELECT * FROM "rule_block" WHERE id = ANY($1) OR name LIKE 'test%'`,
        [ruleBlockIds.map((item) => item.id)],
      );
      // space
      const spaces = await this.spaceRepository.query(
        `SELECT * FROM "space" WHERE name LIKE 'test%'`,
      );
      // spaceImage
      const spaceImages = await this.spaceImageRepository.query(
        `SELECT * FROM "space_image" WHERE space_id = ANY($1)`,
        [spaces.map((item) => item.id)],
      );
      // spaceEquipment
      const spaceEquipments = await this.spaceEquipmentRepository.query(
        `SELECT * FROM "space_equipment" WHERE space_id = ANY($1)`,
        [spaces.map((item) => item.id)],
      );
      // spaceEvent
      const spaceEvents = await this.spaceEventRepository.query(
        `SELECT * FROM "space_event" WHERE space_id = ANY($1)`,
        [spaces.map((item) => item.id)],
      );
      // spaceEventImage
      const spaceEventImages = await this.spaceEventImageRepository.query(
        `SELECT * FROM "space_event_image" WHERE space_event_id = ANY($1)`,
        [spaceEvents.map((item) => item.id)],
      );
      // spacePermissioner
      const spacePermissioners = await this.spacePermissionerRepository.query(
        `SELECT * FROM "space_permissioner" WHERE space_id = ANY($1)`,
        [spaces.map((item) => item.id)],
      );
      // permissionRequest
      const permissionRequests = await this.permissionRequestRepository.query(
        `SELECT * FROM "permission_request"
          WHERE
            space_id = ANY($1)
          OR
            space_event_id = ANY($2)
          OR
            space_rule_id = ANY($3)
          OR
            space_event_rule_id = ANY($3)
        `,
        [
          spaces.map((item) => item.id),
          spaceEvents.map((item) => item.id),
          rules.map((item) => item.id),
        ],
      );
      // permissionResponse
      const permissionResponses = await this.permissionResponseRepository.query(
        `SELECT * FROM "permission_response"
          WHERE
            permission_request_id = ANY($1)
        `,
        [permissionRequests.map((item) => item.id)],
      );
      // mock down many-to-many relations
      await this.client.query(
        `DELETE FROM "space_approved_rule" WHERE rule_id = ANY($1)`,
        [rules.map((item) => item.id)],
      );
      await this.client.query(
        `DELETE FROM "rule_rule_block" WHERE rule_id = ANY($1) OR rule_block_id = ANY($2)`,
        [rules.map((item) => item.id), ruleBlocks.map((item) => item.id)],
      );
      await this.client.query(
        `DELETE FROM "permission_response" WHERE id = ANY($1)`,
        [permissionResponses.map((item) => item.id)],
      );
      await this.client.query(
        `DELETE FROM "space_permissioner" WHERE id = ANY($1)`,
        [spacePermissioners.map((item) => item.id)],
      );
      await this.client.query(
        `DELETE FROM "rule_topic" WHERE rule_id = ANY($1)`,
        [rules.map((item) => item.id)],
      );
      await this.client.query(
        `DELETE FROM "space_topic" WHERE space_id = ANY($1)`,
        [spaces.map((item) => item.id)],
      );
      await this.client.query(
        `DELETE FROM "space_event_topic" WHERE space_event_id = ANY($1)`,
        [spaceEvents.map((item) => item.id)],
      );
      // mock down datasets
      await this.client.query(
        `DELETE FROM "permission_request" WHERE id = ANY($1)`,
        [permissionRequests.map((item) => item.id)],
      );
      await this.client.query(`DELETE FROM "space_image" WHERE id = ANY($1)`, [
        spaceImages.map((item) => item.id),
      ]);
      await this.client.query(
        `DELETE FROM "space_equipment" WHERE id = ANY($1)`,
        [spaceEquipments.map((item) => item.id)],
      );
      await this.client.query(
        `DELETE FROM "space_event_image" WHERE id = ANY($1)`,
        [spaceEventImages.map((item) => item.id)],
      );
      await this.client.query(`DELETE FROM "space_event" WHERE id = ANY($1)`, [
        spaceEvents.map((item) => item.id),
      ]);
      await this.client.query(`DELETE FROM "space" WHERE id = ANY($1)`, [
        spaces.map((item) => item.id),
      ]);
      await this.client.query(`DELETE FROM "rule_block" WHERE id = ANY($1)`, [
        ruleBlocks.map((item) => item.id),
      ]);
      await this.client.query(`DELETE FROM "rule" WHERE id = ANY($1)`, [
        rules.map((item) => item.id),
      ]);
      await this.client.query(
        `DELETE FROM "user_notification" WHERE id = ANY($1)`,
        [userNotifications.map((item) => item.id)],
      );
      await this.client.query(`DELETE FROM "user" WHERE id = ANY($1)`, [
        users.map((item) => item.id),
      ]);

      await this.client.query('COMMIT');
      this.logger.log(`mockup: Successfully removed previous mockup.`);
    } catch (error) {
      await this.client.query('ROLLBACK');
      this.logger.log(`mockup: Error removing previous mockup`, error);
    }
  }

  async up() {
    try {
      const {
        createUserDtos,
        createSpaceRuleBlockDtos,
        createSpaceRuleDtos,
        createSpaceDtos,
        createSpaceEventRuleBlockDtos,
        createSpaceEventRuleDtos,
        createSpaceEquipmentDtos,
        createSpaceEventDtos,
        createSpaceImageDtos,
        createSpaceEventImageDtos,
      } = mockup;

      const topics =
        (
          await this.topicService.findAll(
            { isActive: true },
            { isPagination: false },
          )
        )?.data ?? [];

      const users = [];
      const spaceRuleBlocks = [];
      const spaceRules = [];
      const spaceEventRuleBlocks = [];
      const spaceEventRules = [];
      const spaces = [];
      const spaceEquipments = [];
      const spacePermissioners = [];
      const spaceEvents = [];

      for (const createUserDto of createUserDtos) {
        const user = (
          await this.userService.create(createUserDto, {
            isNotification: false,
          })
        ).data.user;
        users.push(user);
      }

      const spaceRuleBlockAuthor = users[0];
      const spaceEventRuleBlockAuthor = users[1];
      const eventOrganizer = users[2];

      for (const createRuleBlockDto of createSpaceRuleBlockDtos.map((item) => {
        return {
          id: item.id,
          name: item.name,
          type: item.type,
          content: item.content,
          details: item.details,
        };
      })) {
        spaceRuleBlocks.push(
          await this.ruleBlockService.create(
            spaceRuleBlockAuthor.id,
            createRuleBlockDto,
          ),
        );
      }

      for (const [i, createRuleDto] of createSpaceRuleDtos.entries()) {
        spaceRules.push(
          await this.ruleService.createSpaceRule(spaceRuleBlockAuthor.id, {
            ...createRuleDto,
            topicIds: [topics[i].id],
          }),
        );
      }

      for (const [i, createSpaceDto] of createSpaceDtos
        .map((item) => {
          return {
            name: item.name,
            country: item.country,
            region: item.region,
            city: item.city,
            district: item.district,
            address: item.address,
            zipcode: item.zipcode,
            latitude: item.latitude,
            longitude: item.longitude,
            details: item.details,
          };
        })
        .entries()) {
        spaces.push(
          await this.spaceService.create(users[i].id, {
            ...createSpaceDto,
            ruleId: spaceRules[i].id,
            topicIds: [topics[i + 1].id],
          }),
        );
      }

      for (const space of spaces) {
        createSpaceImageDtos
          .splice(0, 1)
          .forEach(async (createSpaceImageDto) => {
            await this.spaceImageService.create({
              id: createSpaceImageDto.id,
              link: createSpaceImageDto.link,
              type: createSpaceImageDto.type,
              spaceId: space.id,
            });
          });
      }

      for (const [i, createSpaceEquipmentDto] of createSpaceEquipmentDtos
        .map((item) => {
          return {
            name: item.name,
            type: item.type,
            quantity: item.quantity,
            details: item.details,
          };
        })
        .entries()) {
        spaceEquipments.push(
          await this.spaceEquipmentService.create({
            ...createSpaceEquipmentDto,
            spaceId: spaces[i].id,
          }),
        );
      }

      for (const createRuleBlockDto of createSpaceEventRuleBlockDtos.map(
        (item) => {
          return {
            id: item.id,
            name: item.name,
            type: item.type,
            content: item.content,
            files: item.files,
          };
        },
      )) {
        let { content } = createRuleBlockDto;
        const { name, type } = createRuleBlockDto;
        if (type === RuleBlockType.spaceEventRequireEquipment) {
          if (name.includes('event1')) {
            const spaceEquipment = spaceEquipments[0];
            content = `${spaceEquipment.id}^${spaceEquipment.quantity}`;
          }
          if (name.includes('event2')) {
            const spaceEquipment = spaceEquipments[1];
            content = `${spaceEquipment.id}^${spaceEquipment.quantity}`;
          }
          if (name.includes('event3')) {
            const spaceEquipment = spaceEquipments[2];
            content = `${spaceEquipment.id}^${spaceEquipment.quantity}`;
          }
          if (name.includes('event4')) {
            const spaceEquipment = spaceEquipments[3];
            content = `${spaceEquipment.id}^${spaceEquipment.quantity}`;
          }
        }
        spaceEventRuleBlocks.push(
          await this.ruleBlockService.create(spaceEventRuleBlockAuthor.id, {
            ...createRuleBlockDto,
            content,
          }),
        );
      }

      for (const [i, createRuleDto] of createSpaceEventRuleDtos.entries()) {
        spaceEventRules.push(
          await this.ruleService.createSpaceEventRule(
            spaceEventRuleBlockAuthor.id,
            {
              ...createRuleDto,
              topicIds: [topics[i + 2].id],
            },
          ),
        );
      }

      for (const spaceEventRule of spaceEventRules) {
        await this.spaceApprovedRuleService.create({
          spaceId: spaces[0].id,
          ruleId: spaceEventRule.id,
        });
      }

      for (const [i, space] of spaces.entries()) {
        spacePermissioners.push(
          await this.spacePermissionerService.create(
            {
              spaceId: space.id,
              userId: i + 1 < users.length ? users[i + 1].id : users[0].id,
            },
            { isActive: true },
          ),
        );
      }

      for (const [i, createSpaceEventDto] of createSpaceEventDtos
        .map((item) => {
          return {
            name: item.name,
            details: item.details,
            duration: item.duration,
            startsAt: item.startsAt,
          };
        })
        .entries()) {
        spaceEvents.push(
          await this.spaceEventService.create(eventOrganizer.id, {
            ...createSpaceEventDto,
            spaceId: spaces[i].id,
            ruleId: spaceEventRules[i].id,
            topicIds: [topics[i + 2].id],
          }),
        );
      }

      for (const spaceEvent of spaceEvents) {
        createSpaceEventImageDtos
          .splice(0, 2)
          .forEach(async (createSpaceEventImageDto) => {
            await this.spaceEventImageService.create({
              id: createSpaceEventImageDto.id,
              link: createSpaceEventImageDto.link,
              spaceEventId: spaceEvent.id,
            });
          });
      }

      await this.spaceEventService.updateToPermissionRequested(
        spaceEvents[3].id,
      );
      await this.spaceEventService.updateToPermissionGranted(spaceEvents[3].id);
      await this.spaceEventService.updateToRunning(spaceEvents[3].id);

      this.logger.log(`mockup: Successfully mocked up test data`);
    } catch (error) {
      this.logger.error(`mockup: Failed to mock up test data`, error);
    }
  }

  async parseCsv(filePath: string): Promise<any[]> {
    if (process.env.NODE_ENV === 'dev') {
      filePath = `/app/src/lib/mockup/${filePath}`;
    } else {
      filePath = path.join(__dirname, filePath);
    }

    return new Promise((resolve, reject) => {
      const results: any[] = [];

      // Use csv-parser to parse the file
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (err) => reject(err));
    });
  }

  async downProd() {
    try {
      const [user] = await this.userRepository.query(
        `SELECT * FROM "user" ORDER BY created_at ASC LIMIT 1`,
      );

      const spaces = await this.spaceRepository.query(
        `SELECT * FROM "space" WHERE owner_id = $1`,
        [user.id],
      );
      const spaceEvents = await this.spaceEventRepository.query(
        `SELECT * FROM space_event WHERE space_id = ANY($1)`,
        [spaces.map((item) => item.id)],
      );
      const spaceEventTopics = await this.spaceEventRepository.query(
        `SELECT * FROM space_event_topic WHERE space_event_id = ANY($1)`,
        [spaceEvents.map((item) => item.id)],
      );
      const permissionRequests = await this.permissionRequestRepository.query(
        `SELECT * FROM permission_request WHERE space_id = ANY($1)`,
        [spaces.map((item) => item.id)],
      );
      const spaceHistories = await this.spaceHistoryRepository.query(
        `SELECT * FROM space_history WHERE space_id = ANY($1)`,
        [spaces.map((item) => item.id)],
      );
      const spaceImages = await this.spaceImageRepository.query(
        `SELECT * FROM space_image WHERE space_id = ANY($1)`,
        [spaces.map((item) => item.id)],
      );
      const spacePermissioners = await this.spacePermissionerRepository.query(
        `SELECT * FROM space_permissioner WHERE space_id = ANY($1)`,
        [spaces.map((item) => item.id)],
      );
      const spaceTopics = await this.spaceTopicRepository.query(
        `SELECT * FROM space_topic WHERE space_id = ANY($1)`,
        [spaces.map((item) => item.id)],
      );
      const ruleBlocks = await this.ruleBlockRepository.query(
        `SELECT * FROM rule_block WHERE author_id = $1`,
        [user.id],
      );
      const rules = await this.ruleBlockRepository.query(
        `SELECT * FROM rule WHERE author_id = $1`,
        [user.id],
      );
      const ruleTopics = await this.spaceHistoryRepository.query(
        `SELECT * FROM rule_topic WHERE rule_id = ANY($1)`,
        [rules.map((item) => item.id)],
      );
      const ruleRuleBlocks = (
        await this.client.query(
          `SELECT * FROM rule_rule_block WHERE rule_id = ANY($1)`,
          [rules.map((item) => item.id)],
        )
      )?.rows;
      const spaceEquipments = await this.spaceEquipmentRepository.query(
        `SELECT * FROM space_equipment WHERE space_id = ANY($1)`,
        [spaces.map((item) => item.id)],
      );
      const spaceApprovedRules = await this.spaceApprovedRuleRepository.query(
        `SELECT * FROM space_approved_rule WHERE space_id = ANY($1)`,
        [spaces.map((item) => item.id)],
      );

      await this.client
        .query(`DELETE FROM user_notification WHERE user_id = $1`, [user.id])
        .catch((error) => {
          this.logger.error(`Failed to delete user`, error);
          throw error;
        });
      if (permissionRequests) {
        await this.client
          .query(`DELETE FROM permission_request WHERE id = ANY($1)`, [
            permissionRequests.map((item) => item.id),
          ])
          .catch((error) => {
            this.logger.error(`Failed to delete permissionRequests`, error);
            throw error;
          });
      }
      if (spaceEventTopics) {
        await this.client
          .query(
            `DELETE FROM space_event_topic WHERE space_event_id = ANY($1)`,
            [spaceEvents.map((item) => item.id)],
          )
          .catch((error) => {
            this.logger.error(`Failed to delete spaceEventTopics`, error);
            throw error;
          });
      }
      if (spaceEvents) {
        await this.client
          .query(`DELETE FROM space_event WHERE id = ANY($1)`, [
            spaceEvents.map((item) => item.id),
          ])
          .catch((error) => {
            this.logger.error(`Failed to delete spaceEvents`, error);
            throw error;
          });
      }
      if (spaceHistories) {
        await this.client
          .query(`DELETE FROM space_history WHERE id = ANY($1)`, [
            spaceHistories.map((item) => item.id),
          ])
          .catch((error) => {
            this.logger.error(`Failed to delete spaceHistories`, error);
            throw error;
          });
      }
      if (spaceApprovedRules) {
        await this.client
          .query(`DELETE FROM space_approved_rule WHERE space_id = ANY($1)`, [
            spaces.map((item) => item.id),
          ])
          .catch((error) => {
            this.logger.error(`Failed to delete spaceApprovedRules`, error);
            throw error;
          });
      }
      if (spaceImages) {
        await this.client
          .query(`DELETE FROM space_image WHERE id = ANY($1)`, [
            spaceImages.map((item) => item.id),
          ])
          .catch((error) => {
            this.logger.error(`Failed to delete spaceImages`, error);
            throw error;
          });
      }
      if (spacePermissioners) {
        await this.client
          .query(`DELETE FROM space_permissioner WHERE id = ANY($1)`, [
            spacePermissioners.map((item) => item.id),
          ])
          .catch((error) => {
            this.logger.error(`Failed to delete spacePermissioners`, error);
            throw error;
          });
      }
      if (spaceTopics) {
        await this.client
          .query(`DELETE FROM space_topic WHERE space_id = ANY($1)`, [
            spaces.map((item) => item.id),
          ])
          .catch((error) => {
            this.logger.error(`Failed to delete spaceTopics`, error);
            throw error;
          });
      }
      if (ruleTopics) {
        await this.client
          .query(`DELETE FROM rule_topic WHERE rule_id = ANY($1)`, [
            rules.map((item) => item.id),
          ])
          .catch((error) => {
            this.logger.error(`Failed to delete ruleTopics`, error);
            throw error;
          });
      }
      if (spaceEquipments) {
        await this.client
          .query(`DELETE FROM space_equipment WHERE id = ANY($1)`, [
            spaceEquipments.map((item) => item.id),
          ])
          .catch((error) => {
            this.logger.error(`Failed to delete spaceEquipments`, error);
            throw error;
          });
      }
      if (spaces) {
        await this.client
          .query(`DELETE FROM space WHERE id = ANY($1)`, [
            spaces.map((item) => item.id),
          ])
          .catch((error) => {
            this.logger.error(`Failed to delete spaces`, error);
            throw error;
          });
      }
      if (ruleRuleBlocks) {
        await this.client
          .query(`DELETE FROM rule_rule_block WHERE rule_id = ANY($1)`, [
            rules.map((item) => item.id),
          ])
          .catch((error) => {
            this.logger.error(`Failed to delete ruleRuleBlocks`, error);
            throw error;
          });
      }
      if (rules) {
        await this.client
          .query(`DELETE FROM rule WHERE id = ANY($1)`, [
            rules.map((item) => item.id),
          ])
          .catch((error) => {
            this.logger.error(`Failed to delete rules`, error);
            throw error;
          });
      }
      if (ruleBlocks) {
        await this.client
          .query(`DELETE FROM rule_block WHERE id = ANY($1)`, [
            ruleBlocks.map((item) => item.id),
          ])
          .catch((error) => {
            this.logger.error(`Failed to delete ruleBlocks`, error);
            throw error;
          });
      }

      this.logger.log(`mockup: Successfully mocked down workshop data`);
    } catch (error) {
      this.logger.error(`mockup: Failed to mock down workshop data`, error);
    }
  }

  async upProd() {
    function getIndex(str) {
      const numberPart = str.match(/\d+/); // This will match the first sequence of digits

      return parseInt(numberPart?.[0]) - 1;
    }

    const [user] = await this.userRepository.query(
      `SELECT * FROM "user" ORDER BY created_at ASC LIMIT 1`,
    );
    try {
      const spaceRuleBlockCsv = await this.parseCsv(
        'prod/london-workshop/space-rule-block.csv',
      );
      const spaceRuleCsv = await this.parseCsv(
        'prod/london-workshop/space-rule.csv',
      );
      const spaceCsv = await this.parseCsv('prod/london-workshop/space.csv');
      const spaceEventRuleBlockCsv = await this.parseCsv(
        'prod/london-workshop/event-rule-block.csv',
      );
      const spaceEventRuleCsv = await this.parseCsv(
        'prod/london-workshop/event-rule.csv',
      );
      const spaceEquipmentCsv = await this.parseCsv(
        'prod/london-workshop/space-equipment.csv',
      );

      const workshopSpaces = [
        {
          space: { id: '' },
          ruleBlocks: [],
          rule: { id: '' },
          spaceEquipments: [],
          spaceImages: { thumbnail: {}, cover: {} },
        },
        {
          space: { id: '' },
          ruleBlocks: [],
          rule: {},
          spaceEquipments: [],
          spaceImages: { thumbnail: {}, cover: {} },
        },
      ];

      const workshopEvents = [
        {
          event: { id: '' },
          ruleBlocks: [],
          rule: { id: '' },
        },
        {
          event: { id: '' },
          ruleBlocks: [],
          rule: { id: '' },
        },
      ];

      // insert spaceRuleBlock
      for (const spaceRuleBlock of spaceRuleBlockCsv) {
        const { index, name, type, details } = spaceRuleBlock;
        let { content } = spaceRuleBlock;
        if (name && type && content) {
          if (type === RuleBlockType.spaceExcludedTopic) {
            const {
              data: [topic],
            } = await this.topicService.findAll({
              names: [content.trim()],
              page: 1,
              limit: 1,
            });

            if (topic) {
              content = topic.id;
            }
          }

          const ruleBlock = await this.ruleBlockService.create(user.id, {
            name: name,
            type: type,
            content: content,
            details: details,
          });

          workshopSpaces[getIndex(index)].ruleBlocks.push(ruleBlock);
        }
      }
      // insert spaceRule
      for (const spaceRule of spaceRuleCsv) {
        const { index, name, topics } = spaceRule;
        if (index && name && topics) {
          const topicNames = topics
            .split(', ')
            .map((item) => item.toLowerCase());

          const ruleTopics = await this.topicService.findAll({
            names: topicNames,
            page: 1,
            limit: 20,
          });
          const topicIds = ruleTopics.data.map((item) => item.id);
          const ruleBlockIds = workshopSpaces[getIndex(index)].ruleBlocks.map(
            (item) => item.id,
          );

          const spaceRule = await this.ruleService.createSpaceRule(user.id, {
            name,
            target: RuleTarget.space,
            ruleBlockIds,
            topicIds,
          });

          workshopSpaces[getIndex(index)].rule = spaceRule;
        }
      }
      // insert space
      for (const space of spaceCsv) {
        const {
          index,
          name,
          zipcode,
          country,
          city,
          region,
          district,
          address,
          latitude,
          longitude,
          details,
          topics,
          thumbnail,
          cover,
          link,
        } = space;
        if (
          index &&
          name &&
          zipcode &&
          country &&
          city &&
          region &&
          district &&
          address &&
          latitude &&
          longitude &&
          details &&
          topics &&
          thumbnail &&
          cover
        ) {
          const topicNames = topics
            .split(', ')
            .map((item) => item.toLowerCase());

          const spaceTopics = await this.topicService.findAll({
            names: topicNames,
            page: 1,
            limit: 20,
          });
          const topicIds = spaceTopics.data.map((item) => item.id);

          const newSpace = await this.spaceService.create(user.id, {
            name,
            zipcode,
            country,
            city,
            region,
            district,
            address,
            latitude,
            longitude,
            details,
            link,
            topicIds,
            ruleId: workshopSpaces[getIndex(index)].rule.id,
          });

          workshopSpaces[getIndex(index)].space = newSpace;

          const spaceThumbnailImage = await this.spaceImageService.create({
            spaceId: newSpace.id,
            type: SpaceImageType.thumbnail,
            link: thumbnail,
          });
          const spaceCoverImage = await this.spaceImageService.create({
            spaceId: newSpace.id,
            type: SpaceImageType.cover,
            link: cover,
          });
          workshopSpaces[getIndex(index)].spaceImages.thumbnail =
            spaceThumbnailImage;
          workshopSpaces[getIndex(index)].spaceImages.cover = spaceCoverImage;
        }
      }

      // insert spaceEquipment
      for (const spaceEquipment of spaceEquipmentCsv) {
        const { index, name, type, quantity, details } = spaceEquipment;
        if (index && name && type && quantity) {
          const newSpaceEquipment = await this.spaceEquipmentService.create({
            spaceId: workshopSpaces[getIndex(index)].space.id,
            name,
            type,
            quantity,
            details,
          });

          workshopSpaces[getIndex(index)].spaceEquipments.push(
            newSpaceEquipment,
          );
        }
      }

      // insert spaceEventRuleBlock
      for (const spaceEventRuleBlock of spaceEventRuleBlockCsv) {
        const { index, name, type, details } = spaceEventRuleBlock;
        let { content } = spaceEventRuleBlock;
        if (name && type && content) {
          if (type === RuleBlockType.spaceEventException) {
            const [ruleBlockType, desiredValue, reason] = content.split(
              RuleBlockContentDivider.type,
            );
            const spaceRuleBlock = workshopSpaces[
              getIndex(index)
            ].ruleBlocks.find((item) => item.type === ruleBlockType);

            content = [spaceRuleBlock.hash, desiredValue, reason].join(
              RuleBlockContentDivider.type,
            );
          }
          if (type === RuleBlockType.spaceEventRequireEquipment) {
            const spaceEquipment = workshopSpaces[
              getIndex(index)
            ].spaceEquipments.find(
              (item) =>
                item.name.trim().toLowerCase() === name.trim().toLowerCase(),
            );

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [_, quantity] = content.split(RuleBlockContentDivider.type);

            content = [spaceEquipment.id, quantity].join(
              RuleBlockContentDivider.type,
            );
          }

          const newRuleBlock = await this.ruleBlockService
            .create(user.id, {
              name: name,
              type: type,
              content: content,
              details: details,
            })
            .catch((error) => {
              throw error;
            });

          workshopEvents[getIndex(index)].ruleBlocks.push(newRuleBlock);
        }
      }

      // insert spaceEventRule
      for (const spaceEventRule of spaceEventRuleCsv) {
        const { index, name, topics } = spaceEventRule;
        if (index && name && topics) {
          const topicNames = topics
            .split(', ')
            .map((item) => item.toLowerCase());

          const ruleTopics = await this.topicService.findAll({
            names: topicNames,
            page: 1,
            limit: 20,
          });
          const topicIds = ruleTopics.data.map((item) => item.id);
          const ruleBlockIds = workshopEvents[getIndex(index)].ruleBlocks.map(
            (item) => item.id,
          );

          const newSpaceEventRule = await this.ruleService.createSpaceEventRule(
            user.id,
            {
              name,
              target: RuleTarget.spaceEvent,
              ruleBlockIds,
              topicIds,
            },
          );

          await this.spaceApprovedRuleService.create({
            spaceId: workshopSpaces[getIndex(index)].space.id,
            ruleId: newSpaceEventRule.id,
          });

          workshopEvents[getIndex(index)].rule = newSpaceEventRule;
        }
      }

      await this.client.query(
        `UPDATE migration SET updated_at = NOW() WHERE name LIKE '%insert-workshop-data.sql' AND is_successful = true`,
      );

      this.logger.log(`mockup: Successfully mocked up workshop data`);
    } catch (error) {
      this.logger.error(`mockup: Failed to insert workshop data`, error);
    }
  }
}
