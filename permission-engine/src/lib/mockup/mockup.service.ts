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
import { Repository } from 'typeorm';
import { UserNotification } from 'src/database/entity/user-notification.entity';
import { User } from 'src/database/entity/user.entity';
import { mockup } from './mockup';
import { RuleBlockType } from 'src/lib/type';
import { SpaceApprovedRuleService } from 'src/api/space-approved-rule/space-approved-rule.service';

@Injectable()
export class MockupService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  private client: PoolClient;
  private prefix: string = 'test';

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserNotification)
    private userNotificationRepository: Repository<UserNotification>,
    @InjectRepository(Space)
    private spaceRepository: Repository<Space>,
    @InjectRepository(SpaceImage)
    private spaceImageRepository: Repository<SpaceImage>,
    @InjectRepository(SpaceEquipment)
    private spaceEquipmentRepository: Repository<SpaceEquipment>,
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
    private readonly logger: Logger,
  ) {
    this.pool = new Pool(this.configService.get<DatabaseConfig>('database'));
  }

  async onModuleInit() {
    if (!this.client) {
      this.client = await this.pool.connect();
    }

    if (process.env.NODE_ENV === 'dev' && process.env.ENGINE_MODE === 'api') {
      await this.down();
      await this.up();
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
        const user = (await this.userService.create(createUserDto, false)).data
          .user;
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
        };
      })) {
        spaceRuleBlocks.push(
          await this.ruleBlockService.create(
            spaceRuleBlockAuthor.id,
            createRuleBlockDto,
          ),
        );
      }

      for (const createRuleDto of createSpaceRuleDtos) {
        spaceRules.push(
          await this.ruleService.create(spaceRuleBlockAuthor.id, {
            ...createRuleDto,
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

      for (const createRuleDto of createSpaceEventRuleDtos) {
        spaceEventRules.push(
          await this.ruleService.create(spaceEventRuleBlockAuthor.id, {
            ...createRuleDto,
          }),
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
            true,
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

      this.logger.log(`mockup: Successfully mocked up test data`);
    } catch (error) {
      this.logger.error(`mockup: Failed to mock up test data`, error);
    }
  }
}
