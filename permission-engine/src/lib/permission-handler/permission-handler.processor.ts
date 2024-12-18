import BigNumber from 'bignumber.js';
import dayjs, { ManipulateType } from 'dayjs';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import {
  PermissionProcessType,
  PermissionRequestResolveStatus,
  PermissionRequestStatus,
  PermissionRequestTarget,
  PermissionResponseStatus,
  RuleBlockContentDivider,
  RuleBlockType,
  UserNotificationTarget,
  UserNotificationTemplateName,
  UserNotificationType,
} from '../type';
import { Logger } from '../logger/logger.service';
import { UserNotificationService } from 'src/api/user-notification/user-notification.service';
import { SpacePermissionerService } from 'src/api/space-permissioner/space-permissioner.service';
import { PermissionResponseService } from 'src/api/permission-response/permission-response.service';
import { PermissionRequestService } from 'src/api/permission-request/permission-request.service';
import { RuleService } from 'src/api/rule/rule.service';
import { SpaceService } from 'src/api/space/space.service';
import { SpaceEventService } from 'src/api/space-event/space-event.service';
import { SpaceApprovedRuleService } from 'src/api/space-approved-rule/space-approved-rule.service';
import { RuleBlockService } from 'src/api/rule-block/rule-block.service';
import {
  isInAvailabilities,
  formatTime,
  hash as hashString,
} from 'src/lib/util';
import { TopicService } from 'src/api/topic/topic.service';

@Processor('permission-handler')
export class PermissionHandlerProcessor {
  constructor(
    private readonly spaceService: SpaceService,
    private readonly spaceEventService: SpaceEventService,
    private readonly spaceApprovedRuleService: SpaceApprovedRuleService,
    private readonly userNotificationService: UserNotificationService,
    private readonly spacePermissionerService: SpacePermissionerService,
    private readonly permissionResponseService: PermissionResponseService,
    private readonly permissionRequestService: PermissionRequestService,
    private readonly ruleService: RuleService,
    private readonly ruleBlockService: RuleBlockService,
    private readonly topicService: TopicService,
    private readonly logger: Logger,
  ) {}

  @Process({ name: 'permission-handler-job', concurrency: 1 })
  async handlePermissionProcess(job: Job<any>) {
    this.logger.log('PermisisonHandlerJob received');

    // Job processing logic
    await new Promise<void>(async (resolve, reject) => {
      try {
        this.logger.log('Handling permission:', job.data);

        switch (job.data.permissionProcessType) {
          case PermissionProcessType.spaceEventPermissionRequestCreated:
            await this.spaceEventPermissionRequestCreated(job.data).then(
              (res) => {
                resolve(res);
              },
            );
            break;
          case PermissionProcessType.spaceRuleChangePermissionRequestCreated:
            await this.spaceRuleChangePermissionRequestCreated(job.data).then(
              (res) => {
                resolve(res);
              },
            );
            break;
          case PermissionProcessType.spaceEventRulePreApprovePermissionRequestCreated:
            await this.spaceEventRulePreApprovePermissionRequestCreated(
              job.data,
            ).then((res) => {
              resolve(res);
            });
            break;
          case PermissionProcessType.permissionResponseReviewed:
            await this.permissionResponseReviewed(job.data).then((res) => {
              resolve(res);
            });
            break;
          case PermissionProcessType.permissionResponseReviewCompleted:
            await this.permissionResponseReviewCompleted(job.data).then(
              (res) => {
                resolve(res);
              },
            );
            break;
          case PermissionProcessType.permissionRequestResolved:
            await this.permissionRequestResolved(job.data).then((res) => {
              resolve(res);
            });
            break;

          default:
            throw new Error(
              `Unsupported permissionProcessType: ${job.data.permissionProcessType}`,
            );
            break;
        }
      } catch (error) {
        // TODO. updateToAssignFailed for suitable cases
        reject(error);
      }
    });

    this.logger.log(
      `permission-handler: ${PermissionProcessType.spaceEventPermissionRequestCreated} Job completed`,
    );
  }

  /**
   * assign responses to SpacePermissioners
   * send notifications to SpacePermissioners and EventOrganizer
   * automatic resolve when conditions are met
   */
  async spaceEventPermissionRequestCreated(option: {
    permissionRequestId: string;
  }) {
    const { permissionRequestId } = option;
    const permissionRequest =
      await this.permissionRequestService.findOneById(permissionRequestId);

    if (
      [
        PermissionRequestStatus.pending,
        PermissionRequestStatus.queued,
      ].includes(permissionRequest.status) === false
    ) {
      return;
    }
    // compare spaceTopics and spaceEventTopics
    // compare spaceRule and spaceEventRule
    const space = await this.spaceService.findOneById(
      permissionRequest.spaceId,
      { relations: ['spaceTopics'] },
    );
    const spaceEvent = await this.spaceEventService.findOneById(
      permissionRequest.spaceEventId,
    );
    const spaceRule = await this.ruleService.findOneById(
      permissionRequest.spaceRuleId,
    );
    let spaceEventRule = await this.ruleService.findOneById(
      permissionRequest.spaceEventRuleId,
    );
    const spaceApprovedRules = await this.spaceApprovedRuleService.findAll({
      spaceId: permissionRequest.spaceId,
      publicHash: permissionRequest.spaceEventRule.publicHash,
      isActive: true,
      page: 1,
      limit: 1,
    });
    const spacePermissioners =
      await this.spacePermissionerService.findAllBySpaceId(
        permissionRequest.spaceId,
        { isActive: true },
        { isPagination: false },
      );
    const spaceRuleBlocks = spaceRule.ruleBlocks;
    /**
     * Auto Approval Conditions
     * (Topic matches the space && No Exceptions or collisions on SpaceRule) || in SpaceApprovedRule table
     */
    let isAutoApproval = true;

    // check spaceApprovedRules
    if (
      !spaceApprovedRules.data.find(
        (item) => item.publicHash === spaceEventRule.publicHash,
      )
    ) {
      isAutoApproval = false;
      // check topics
      const { spaceTopics } = space;
      const spaceDesiredTopics = spaceTopics;
      const spaceForbiddenTopicIds =
        spaceRule.ruleBlocks
          .filter((item) => item.type === RuleBlockType.spaceExcludedTopic)
          ?.map((item) => item.content) ?? [];
      const spaceForbiddenTopics =
        spaceForbiddenTopicIds.length > 0
          ? ((
              await this.topicService.findAll(
                { ids: spaceForbiddenTopicIds },
                { isPagination: false },
              )
            )?.data ?? [])
          : [];
      const {
        topics: spaceEventTopics,
        startsAt,
        duration,
        endsAt,
      } = spaceEvent;

      // check desired topics
      for (const spaceEventTopic of spaceEventTopics) {
        if (
          spaceDesiredTopics.find((item) => item.topicId === spaceEventTopic.id)
        ) {
          isAutoApproval = true;
          break;
        }
      }

      // check forbidden topics
      for (const spaceEventTopic of spaceEventTopics) {
        if (
          spaceForbiddenTopics.find((item) => item.id === spaceEventTopic.id)
        ) {
          isAutoApproval = false; // TODO. force rejection?
          break;
        }
      }

      // check ruleBlock collisions
      // if ruleBlock collision exists, add to spaceEventRule.ruleBlocks as spaceEventException type and save
      const spaceMaxAvailabilityUnitCountRuleBlock = spaceRuleBlocks.find(
        (item) => item.type === RuleBlockType.spaceMaxAvailabilityUnitCount,
      );
      for (const spaceRuleBlock of spaceRuleBlocks) {
        const { type, hash, content } = spaceRuleBlock;
        const spaceEventExceptionRuleBlock = spaceEventRule.ruleBlocks.find(
          (item) =>
            item.type === RuleBlockType.spaceEventException &&
            item.content.split(RuleBlockContentDivider.type)[0] === hash,
        );

        // skip if already exception raised
        if (spaceEventExceptionRuleBlock) {
          continue;
        }

        let isInAutoApprovalRange: boolean = false;
        let desiredValue: any = null;

        // check if in auto approval range
        switch (type) {
          case RuleBlockType.spaceAvailability: // check with spaceEvent.startsAt, spaceEvent.endsAt
            isInAutoApprovalRange = isInAvailabilities(
              content.split(RuleBlockContentDivider.array),
              startsAt,
              endsAt,
            );
            desiredValue = [
              ...content,
              [
                dayjs(startsAt).format('ddd').toLowerCase(),
                formatTime(startsAt),
                formatTime(endsAt),
              ].join(RuleBlockContentDivider.time),
            ];
            break;
          case RuleBlockType.spaceAvailabilityUnit:
            const spaceEventDurationAmount = parseInt(
              duration.slice(0, -1),
              10,
            );
            const spaceEventDurationType = duration.slice(-1);
            const spaceUnitAmount = parseInt(content.slice(0, -1), 10);
            const spaceUnitType = content.slice(-1);
            const spaceMaxAvailabilityUnitCount = parseInt(
              spaceMaxAvailabilityUnitCountRuleBlock.content,
            );
            isInAutoApprovalRange =
              dayjs().add(
                new BigNumber(spaceUnitAmount)
                  .times(spaceMaxAvailabilityUnitCount)
                  .toNumber(),
                spaceUnitType as ManipulateType,
              ) >=
              dayjs().add(
                spaceEventDurationAmount,
                spaceEventDurationType as ManipulateType,
              );
            desiredValue = duration;
            break;
          default:
            continue;
        }

        if (isInAutoApprovalRange === false && !spaceEventExceptionRuleBlock) {
          // add exception ruleBlock to spaceEventRule and save
          const newRuleBlock = await this.ruleBlockService.create(
            spaceEvent.organizerId,
            {
              name: `Exception on space rule: ${spaceRule.name}`,
              type: RuleBlockType.spaceEventException,
              content: [
                hash,
                desiredValue,
                `Automatic exception for ${spaceRule.name}`,
              ].join(RuleBlockContentDivider.type),
              details: `Automatic exception raised by Permissioning Engine`,
            },
          );
          const forkedSpaceEventRule = await this.ruleService.fork(
            spaceEvent.organizerId,
            {
              id: spaceEventRule.id,
              // TODO. translate according to spaceEvent.space.country
              name: `${spaceEventRule.name}-exception-${type.split(':')[1]}`,
            },
            { isPublicOnly: false },
          );

          forkedSpaceEventRule.ruleBlocks.push(newRuleBlock);
          await this.ruleService.update(forkedSpaceEventRule.id, {
            hash: hashString(
              forkedSpaceEventRule.ruleBlocks
                .map((item) => item.hash)
                .sort()
                .join(),
            ),
            ruleBlockIds: spaceEventRule.ruleBlocks.map((item) => item.id),
          });
          spaceEventRule = forkedSpaceEventRule;

          // update sapceEvent.ruleId
          await this.spaceEventService.updateRuleId(
            spaceEvent.id,
            forkedSpaceEventRule.id,
          );
          // update permissionRequest.spaceEventRuleId
          await this.permissionRequestService.updateSpaceEventRuleId(
            permissionRequestId,
            forkedSpaceEventRule.id,
          );
        }
      }

      // check ruleBlock exceptions
      if (
        spaceEventRule.ruleBlocks.find(
          (item) => item.type === RuleBlockType.spaceEventException,
        )
      ) {
        isAutoApproval = false;
      }
    }

    if (isAutoApproval === false) {
      // assign permiossion response
      const spaceConsentTimeoutRuleBlock = spaceRule.ruleBlocks.find(
        (item) => item.type === RuleBlockType.spaceConsentTimeout,
      );
      const timeoutAmount = parseInt(
        spaceConsentTimeoutRuleBlock.content.slice(0, -1),
        10,
      );
      const timeoutType = spaceConsentTimeoutRuleBlock.content.slice(-1);

      if (
        new BigNumber(timeoutAmount).lte(0) &&
        ['d', 'h'].includes(timeoutType) === false
      ) {
        throw new Error(
          `Space rule consent timeout must be in format: {number}{dh}`,
        );
      }

      const timeoutAt = dayjs(permissionRequest.createdAt)
        .add(timeoutAmount, timeoutType as ManipulateType)
        .toDate();

      await this.userNotificationService
        .create({
          userId: permissionRequest.spaceEvent.organizerId,
          target: UserNotificationTarget.eventOrgnaizer,
          type: UserNotificationType.external,
          templateName:
            UserNotificationTemplateName.spaceEventPermissionRequestCreated,
          params: {
            permissionRequestId,
            spaceName: permissionRequest.space.name,
            timeoutAt: timeoutAt,
            spaceEventId: permissionRequest.spaceEvent.id,
          },
        })
        .catch((error) => {
          this.logger.error(
            `Failed to create userNotification: ${error.message}`,
            error,
          );
        });
      const notificationTargetSpacePermissioners =
        spacePermissioners?.data?.filter((spacePermissioner) => {
          return spacePermissioner.userId !== permissionRequest.userId;
        });
      try {
        notificationTargetSpacePermissioners.map(async (spacePermissioner) => {
          try {
            const permissionResponse = await this.permissionResponseService
              .create({
                permissionRequestId: permissionRequest.id,
                spacePermissionerId: spacePermissioner.id,
                timeoutAt,
              })
              .catch((error) => {
                throw new Error(
                  `Failed to create permissionResponse: ${error.message}`,
                );
              });

            await this.userNotificationService
              .create({
                userId: spacePermissioner.userId,
                target: UserNotificationTarget.permissioner,
                type: UserNotificationType.external,
                templateName:
                  UserNotificationTemplateName.spaceEventPermissionRequested,
                params: {
                  permissionRequestId,
                  spaceId: permissionRequest.spaceId,
                  permissionResponseId: permissionResponse.id,
                },
              })
              .catch((error) => {
                throw new Error(
                  `Failed to create userNotification: ${error.message}`,
                );
              });
          } catch (error) {
            this.logger.error(error.message, error);
            throw error;
          }
        });
        // permission response assigned
        await this.permissionRequestService.updateToAssigned(
          permissionRequestId,
        );
      } catch (error) {
        // permission response assign failed
        await this.permissionRequestService.updateToAssignFailed(
          permissionRequestId,
        );
      }
    } else {
      // save spaceApprovedRule
      await this.spaceApprovedRuleService
        .create(
          {
            spaceId: permissionRequest.spaceId,
            ruleId: permissionRequest.spaceEventRuleId,
            permissionRequestId: permissionRequestId,
          },
          { isForce: true },
        )
        .catch((error) => {
          this.logger.error(
            `Failed to create spaceApprovedRule: ${JSON.stringify({
              spaceId: permissionRequest.spaceId,
              ruleId: permissionRequest.spaceEventRuleId,
              permissionRequestId: permissionRequestId,
            })}`,
            error,
          );
        });

      // auto approve permission request
      await this.permissionRequestService
        .updateToReviewApproved(permissionRequestId)
        .then((res) => {
          return res.data.result;
        })
        .catch((error) => {
          this.logger.error(
            `Failed to update permissionRequest to review approved: ${permissionRequestId}`,
            error,
          );
          return false;
        });
      // auto resolve permission request
      await this.permissionRequestService
        .updateToResolveAccepted(permissionRequestId)
        .then((res) => {
          return res.data.result;
        })
        .catch((error) => {
          this.logger.error(
            `Failed to update permissionRequest to resolve accepted: ${permissionRequestId}`,
            error,
          );
          return false;
        });
      // update spaceEvent to permission granted
      await this.spaceEventService
        .updateToPermissionGranted(permissionRequest.spaceEventId)
        .then((res) => {
          return res.data.result;
        })
        .catch((error) => {
          this.logger.error(
            `Failed to update spaceEvent: ${permissionRequest.spaceEventId}`,
            error,
          );
          return false;
        });
      // insert into space approved rules

      await this.spaceApprovedRuleService.create(
        {
          spaceId: permissionRequest.spaceId,
          ruleId: permissionRequest.spaceEventRuleId,
        },
        { isForce: true },
      );

      // notice auto approval
      // notify event organizer
      await this.userNotificationService
        .create({
          userId: permissionRequest.spaceEvent.organizerId,
          target: UserNotificationTarget.eventOrgnaizer,
          type: UserNotificationType.external,
          templateName:
            UserNotificationTemplateName.spaceEventPermissionRequestApproved,
          params: {
            eventId: permissionRequest.spaceEvent.id,
            permissionRequestId: permissionRequest.id,
            eventTitle: permissionRequest.spaceEvent.name,
            excitements: [],
            worries: [],
            conditions: [],
            externalBookingLink: permissionRequest.spaceEvent.callbackLink,
          },
        })
        .catch((error) => {
          this.logger.error(
            `Failed to create userNotification: ${error.message}`,
            error,
          );
        });

      // notify space permissioners
      const notificationTargetSpacePermissioners =
        spacePermissioners?.data?.filter((spacePermissioner) => {
          return spacePermissioner.userId !== permissionRequest.userId;
        });
      notificationTargetSpacePermissioners.map(async (spacePermissioner) => {
        try {
          await this.userNotificationService
            .create({
              userId: spacePermissioner.userId,
              target: UserNotificationTarget.permissioner,
              type: UserNotificationType.external,
              templateName:
                UserNotificationTemplateName.spaceEventPermissionRequestReviewCompleted,
              params: {
                spaceId: permissionRequest.space.id,
                eventTitle: permissionRequest.spaceEvent.name,
                excitements: [],
                worries: [],
                conditions: [],
              },
            })
            .catch((error) => {
              throw new Error(
                `Failed to create userNotification: ${error.message}`,
              );
            });
        } catch (error) {
          this.logger.error(error.message, error);
        }
      });
    }
  }

  /**
   * assign responses to SpacePermissioners
   * send notifications to SpacePermissioners
   */
  async spaceRuleChangePermissionRequestCreated(option: {
    permissionRequestId: string;
  }) {
    const { permissionRequestId } = option;
    const permissionRequest =
      await this.permissionRequestService.findOneById(permissionRequestId);
    const oldSpaceRule = await this.ruleService.findOneById(
      permissionRequest.space.ruleId,
    );
    const newSpaceRule = await this.ruleService.findOneById(
      permissionRequest.spaceRuleId,
    );
    const spacePermissioners =
      await this.spacePermissionerService.findAllBySpaceId(
        permissionRequest.spaceId,
        { isActive: true },
        { isPagination: false },
      );

    const spaceConsentTimeoutRuleBlock = oldSpaceRule.ruleBlocks.find(
      (item) => item.type === RuleBlockType.spaceConsentTimeout,
    );
    const timeoutAmount = parseInt(
      spaceConsentTimeoutRuleBlock.content.slice(0, -1),
      10,
    );
    const timeoutType = spaceConsentTimeoutRuleBlock.content.slice(-1);

    if (
      new BigNumber(timeoutAmount).lte(0) &&
      ['d', 'h'].includes(timeoutType) === false
    ) {
      throw new Error(
        `Space rule consent timeout must be in format: {number}{dh}`,
      );
    }

    const timeoutAt = dayjs(permissionRequest.createdAt)
      .add(timeoutAmount, timeoutType as ManipulateType)
      .toDate();

    await this.userNotificationService
      .create({
        userId: permissionRequest.userId,
        target: UserNotificationTarget.general,
        type: UserNotificationType.external,
        templateName:
          UserNotificationTemplateName.spaceEventPermissionRequestCreated,
        params: {
          permissionRequestId,
          oldSpaceRuleId: oldSpaceRule.id,
          oldSpaceRuleName: oldSpaceRule.name,
          oldSpaceRuleBlocks: oldSpaceRule.ruleBlocks,
          newSpaceRuleId: newSpaceRule.id,
          newSpaceRuleName: newSpaceRule.name,
          newSpaceRuleRuleBlocks: newSpaceRule.ruleBlocks,
        },
      })
      .catch((error) => {
        throw new Error(`Failed to create userNotification: ${error.message}`);
      });

    const notificationTargetSpacePermissioners =
      spacePermissioners?.data?.filter((spacePermissioner) => {
        return spacePermissioner.userId !== permissionRequest.userId;
      }) ?? [];
    notificationTargetSpacePermissioners.map(async (spacePermissioner) => {
      try {
        const permissionResponse = await this.permissionResponseService
          .create({
            permissionRequestId: permissionRequest.id,
            spacePermissionerId: spacePermissioner.id,
            timeoutAt,
          })
          .catch((error) => {
            throw new Error(
              `Failed to create permissionResponse: ${error.message}`,
            );
          });

        await this.userNotificationService
          .create({
            userId: spacePermissioner.userId,
            target: UserNotificationTarget.general,
            type: UserNotificationType.external,
            templateName:
              UserNotificationTemplateName.spaceRuleChangePermissionRequested,
            params: {
              permissionRequestId,
              oldSpaceRuleId: oldSpaceRule.id,
              oldSpaceRuleName: oldSpaceRule.name,
              oldSpaceRuleBlocks: oldSpaceRule.ruleBlocks,
              newSpaceRuleId: newSpaceRule.id,
              newSpaceRuleName: newSpaceRule.name,
              newSpaceRuleRuleBlocks: newSpaceRule.ruleBlocks,
              permissionResponseId: permissionResponse.id,
              permissionResponseTimeoutAt: permissionResponse.timeoutAt,
            },
          })
          .catch((error) => {
            throw new Error(
              `Failed to create userNotification: ${error.message}`,
            );
          });
      } catch (error) {
        this.logger.error(error.message, error);
      }
    });
  }

  /**
   * assign responses to SpacePermissioners
   * send notifications to SpacePermissioners
   */
  async spaceEventRulePreApprovePermissionRequestCreated(option: {
    permissionRequestId: string;
  }) {
    const { permissionRequestId } = option;
    const permissionRequest =
      await this.permissionRequestService.findOneById(permissionRequestId);
    const spaceRule = await this.ruleService.findOneById(
      permissionRequest.spaceRuleId,
    );
    const spaceEventRule = await this.ruleService.findOneById(
      permissionRequest.spaceEventRuleId,
    );
    const spacePermissioners =
      await this.spacePermissionerService.findAllBySpaceId(
        permissionRequest.spaceId,
        { isActive: true },
        { isPagination: false },
      );
    const spaceConsentTimeoutRuleBlock = spaceRule.ruleBlocks.find(
      (item) => item.type === RuleBlockType.spaceConsentTimeout,
    );
    const timeoutAmount = parseInt(
      spaceConsentTimeoutRuleBlock.content.slice(0, -1),
      10,
    );
    const timeoutType = spaceConsentTimeoutRuleBlock.content.slice(-1);

    if (
      new BigNumber(timeoutAmount).lte(0) &&
      ['d', 'h'].includes(timeoutType) === false
    ) {
      throw new Error(
        `Space rule consent timeout must be in format: {number}{dh}`,
      );
    }

    const timeoutAt = dayjs(permissionRequest.createdAt)
      .add(timeoutAmount, timeoutType as ManipulateType)
      .toDate();

    await this.userNotificationService
      .create({
        userId: permissionRequest.userId,
        target: UserNotificationTarget.general,
        type: UserNotificationType.external,
        templateName:
          UserNotificationTemplateName.spaceEventRulePreApprovePermissionRequested,
        params: {
          permissionRequestId,
          spaceEventRuleId: spaceEventRule.id,
          spaceEventRuleName: spaceEventRule.name,
          spaceEventRuleBlocks: spaceEventRule.ruleBlocks,
        },
      })
      .catch((error) => {
        throw new Error(`Failed to create userNotification: ${error.message}`);
      });

    const notificationTargetSpacePermissioners =
      spacePermissioners?.data?.filter((spacePermissioner) => {
        return spacePermissioner.userId !== permissionRequest.userId;
      }) ?? [];
    notificationTargetSpacePermissioners.map(async (spacePermissioner) => {
      try {
        const permissionResponse = await this.permissionResponseService
          .create({
            permissionRequestId: permissionRequest.id,
            spacePermissionerId: spacePermissioner.id,
            timeoutAt,
          })
          .catch((error) => {
            throw new Error(
              `Failed to create permissionResponse: ${error.message}`,
            );
          });

        await this.userNotificationService
          .create({
            userId: spacePermissioner.userId,
            target: UserNotificationTarget.general,
            type: UserNotificationType.external,
            templateName:
              UserNotificationTemplateName.spaceEventRulePreApprovePermissionRequested,
            params: {
              permissionRequestId,
              spaceEventRuleId: spaceEventRule.id,
              spaceEventRuleName: spaceEventRule.name,
              spaceEventRuleBlocks: spaceEventRule.ruleBlocks,
              permissionResponseId: permissionResponse.id,
              permissionResponseTimeoutAt: permissionResponse.timeoutAt,
            },
          })
          .catch((error) => {
            throw new Error(
              `Failed to create userNotification: ${error.message}`,
            );
          });
      } catch (error) {
        this.logger.error(error.message, error);
      }
    });
  }

  async permissionResponseReviewCompleted(option: {
    permissionRequestId: string;
  }) {
    const { permissionRequestId } = option;
    const permissionRequest =
      await this.permissionRequestService.findOneById(permissionRequestId);
    const { permissionResponses, spaceEventId } = permissionRequest;

    if (!permissionResponses || !permissionResponses?.[0]) {
      return;
    }

    const { timeoutAt } = permissionResponses[0];
    const reviewedResponses = permissionResponses.filter(
      (item) =>
        [
          PermissionResponseStatus.pending,
          PermissionResponseStatus.timeout,
        ].includes(item.status) === false,
    );

    const spacePermissioners =
      await this.spacePermissionerService.findAllBySpaceId(
        permissionRequest.spaceId,
        { isActive: true },
        { isPagination: false },
      );
    const notificationTargetSpacePermissioners =
      spacePermissioners?.data?.filter((spacePermissioner) => {
        return spacePermissioner.userId !== permissionRequest.userId;
      }) ?? [];
    const spaceRule = await this.ruleService.findOneById(
      permissionRequest.space.ruleId,
    );
    const consentMethod = spaceRule.ruleBlocks.find(
      (item) => item.type === RuleBlockType.spaceConsentMethod,
    );
    const [operator, percent, flag] = consentMethod.content.split(
      RuleBlockContentDivider.operator,
    );
    const oldSpaceRuleId = permissionRequest.space.ruleId;
    const newSpaceRuleId = permissionRequest.spaceRuleId;

    const permissionRequestType =
      oldSpaceRuleId === newSpaceRuleId
        ? permissionRequest.spaceEventId
          ? PermissionRequestTarget.spaceEvent
          : PermissionRequestTarget.spaceEventRulePreApprove
        : PermissionRequestTarget.spaceRule;

    // Everyone reviewed || timeout reached: can resolve
    const isResolveReady =
      permissionResponses.length === reviewedResponses.length ||
      dayjs(timeoutAt) <= dayjs();

    if (isResolveReady === true) {
      const timeoutResponses = permissionResponses.filter(
        (item) => item.status === PermissionResponseStatus.pending,
      );

      for (const permissionResponse of timeoutResponses) {
        await this.permissionResponseService.updateToTimeout(
          permissionResponse.id,
        );
      }

      const approvedResponses = permissionResponses.filter((item) =>
        [PermissionResponseStatus.approved].includes(item.status),
      );
      const approvedWithConditionResponses = permissionResponses.filter(
        (item) =>
          [PermissionResponseStatus.approvedWithCondition].includes(
            item.status,
          ),
      );
      const rejectedResponses = permissionResponses.filter((item) =>
        [PermissionResponseStatus.rejected].includes(item.status),
      );

      let isConsent = false;

      function comparePercent(operator: string, a: string, b: string) {
        let result = false;
        switch (operator) {
          case 'over':
            result = new BigNumber(a).gte(new BigNumber(b));
            break;
          case 'under':
            result = new BigNumber(a).lte(new BigNumber(b));
            break;
          case 'is':
            result = new BigNumber(a).eq(new BigNumber(b));
            break;
          default:
            break;
        }

        return result;
      }

      if (flag.toLowerCase() === 'yes') {
        const approvedPercent = new BigNumber(approvedResponses.length)
          .plus(approvedWithConditionResponses.length)
          .div(reviewedResponses.length)
          .times(100)
          .toString();
        isConsent = comparePercent(operator, approvedPercent, percent);
      } else if (flag.toLowerCase() == 'no') {
        const rejectedPercent = new BigNumber(rejectedResponses.length)
          .div(reviewedResponses.length)
          .times(100)
          .toString();
        isConsent = comparePercent(operator, rejectedPercent, percent);
      } else {
        this.logger.log(
          `Invalid space rule consentMethod operator: ${operator}`,
        );
      }

      // update PermissionRequest status to approved or rejected
      // send notifications to SpacePermissioners and EventOrganizer
      // TODO. add comments to ruleBlocks
      let permissionRequestStatus = PermissionRequestStatus.assigned;
      let permissionRequestResolveStatus = null;
      if (
        isConsent === true &&
        approvedResponses.length > 0 &&
        approvedWithConditionResponses.length === 0
      ) {
        permissionRequestStatus = PermissionRequestStatus.reviewApproved;
        await this.permissionRequestService.updateToReviewApproved(
          permissionRequest.id,
        );

        // add to space approved rule table
        await this.spaceApprovedRuleService.create(
          {
            spaceId: permissionRequest.spaceId,
            ruleId: permissionRequest.spaceEventRuleId,
            permissionRequestId: permissionRequestId,
          },
          { isForce: true },
        );
      } else if (
        isConsent === true &&
        approvedWithConditionResponses.length > 0
      ) {
        permissionRequestStatus =
          PermissionRequestStatus.reviewApprovedWithCondition;
        await this.permissionRequestService.updateToReviewApprovedWithCondition(
          permissionRequest.id,
        );
      } else if (isConsent === false) {
        permissionRequestStatus = PermissionRequestStatus.reviewRejected;
        await this.permissionRequestService.updateToReviewRejected(
          permissionRequest.id,
        );
      }

      // collect conditions, excitements, worries
      let conditions = [];
      let excitements = [];
      let worries = [];
      let templateName: UserNotificationTemplateName;

      reviewedResponses.forEach((permissionResponse) => {
        conditions = [...conditions, ...(permissionResponse?.conditions ?? [])];
        excitements = [
          ...excitements,
          ...(permissionResponse?.excitements ?? []),
        ];
        worries = [...worries, ...(permissionResponse?.worries ?? [])];
      });

      // resolve if spaceRule update permission request
      // resolve if spaceEvent permission request rejected
      if (permissionRequestType === PermissionRequestTarget.spaceRule) {
        if (isConsent === true) {
          permissionRequestResolveStatus =
            PermissionRequestResolveStatus.resolveAccepted;
          templateName =
            UserNotificationTemplateName.spaceRuleChangePermissionRequestApproved;
          await this.permissionRequestService.updateToResolveAccepted(
            permissionRequest.id,
            { isForce: true },
          );
          await this.spaceService.update(permissionRequest.spaceId, {
            ruleId: permissionRequest.spaceRuleId,
          });
        } else {
          permissionRequestResolveStatus =
            PermissionRequestResolveStatus.resolveRejected;
          templateName =
            UserNotificationTemplateName.spaceRuleChangePermissionRequestRejected;
          await this.permissionRequestService.updateToResolveRejected(
            permissionRequest.id,
            { isForce: true },
          );
        }
      } else if (
        permissionRequestType ===
        PermissionRequestTarget.spaceEventRulePreApprove
      ) {
        if (isConsent === true) {
          permissionRequestResolveStatus =
            PermissionRequestResolveStatus.resolveAccepted;
          templateName =
            UserNotificationTemplateName.spaceEventPreApprovePermissionRequestApproved;
          await this.permissionRequestService.updateToResolveAccepted(
            permissionRequest.id,
            { isForce: true },
          );
          await this.spaceApprovedRuleService.create(
            {
              spaceId: permissionRequest.spaceId,
              ruleId: permissionRequest.spaceEventRuleId,
            },
            { isForce: true },
          );
        } else {
          permissionRequestResolveStatus =
            PermissionRequestResolveStatus.resolveRejected;
          templateName =
            UserNotificationTemplateName.spaceEventPreApprovePermissionRequestRejected;
          await this.permissionRequestService.updateToResolveRejected(
            permissionRequest.id,
            { isForce: true },
          );
        }
      } else if (permissionRequestType === PermissionRequestTarget.spaceEvent) {
        if (isConsent === false) {
          permissionRequestResolveStatus =
            PermissionRequestResolveStatus.resolveRejected;
          templateName =
            UserNotificationTemplateName.spaceEventPermissionRequestRejected;
          await this.permissionRequestService.updateToResolveRejected(
            permissionRequest.id,
            { isForce: true },
          );
          await this.spaceEventService.updateToPermissionRejected(spaceEventId);
        }
      }

      // insert userNotifications
      try {
        // userNotification for permissionRequest creater
        await this.userNotificationService
          .create({
            userId: permissionRequest.userId,
            target: UserNotificationTarget.general,
            type: UserNotificationType.external,
            templateName,
            params: {
              permissionRequestId: permissionRequest.id,
              permissionRequestStatus,
              permissionRequestResolveStatus,
              conditions,
              excitements,
              worries,
            },
          })
          .catch((error) => {
            throw new Error(
              `Failed to create userNotification: ${error.message}`,
            );
          });
        // userNotification for spacePermissioners
        notificationTargetSpacePermissioners.forEach(
          async (spacePermissioner) => {
            await this.userNotificationService
              .create({
                userId: spacePermissioner.userId,
                target: UserNotificationTarget.general,
                type: UserNotificationType.external,
                templateName, // TODO. assign right template for permissioners
                params: {
                  permissionRequestId: permissionRequest.id,
                  permissionRequestStatus,
                  permissionRequestResolveStatus,
                  conditions,
                  excitements,
                  worries,
                },
              })
              .catch((error) => {
                throw new Error(
                  `Failed to create userNotification: ${error.message}`,
                );
              });
          },
        );
      } catch (error) {
        this.logger.error(error.message, error);
      }
    }
  }

  /**
   * check review complete condition according to consentMethod of the space rule
   * update PermissionRequest status to approved or rejected
   * send notifications to SpacePermissioners and EventOrganizer
   * add comments to ruleBlocks
   * for spaceRule update permission requests, it will be resolved from here
   */
  async permissionResponseReviewed(option: { permissionResponseId: string }) {
    const { permissionResponseId } = option;
    const permissionResponse =
      await this.permissionResponseService.findOneById(permissionResponseId);

    await this.permissionResponseReviewCompleted({
      permissionRequestId: permissionResponse.permissionRequestId,
    });
  }

  /**
   * check PermissionRequest.resolveStatus
   * update SpaceEvent status to permissionGranted or permissionRejected
   */
  async permissionRequestResolved(option: { permissionRequestId: string }) {
    const { permissionRequestId } = option;
    const permissionRequest =
      await this.permissionRequestService.findOneById(permissionRequestId);
    const spacePermissioners =
      await this.spacePermissionerService.findAllBySpaceId(
        permissionRequest.spaceId,
        { isActive: true },
        { isPagination: false },
      );

    const notificationTargetSpacePermissioners =
      spacePermissioners?.data?.filter((spacePermissioner) => {
        return spacePermissioner.userId !== permissionRequest.userId;
      }) ?? [];

    const { status, resolveStatus, permissionResponses, spaceEventId } =
      permissionRequest;

    // collect conditions, excitements, worries
    let conditions = [];
    let excitements = [];
    let worries = [];

    permissionResponses.forEach((permissionResponse) => {
      conditions = [...conditions, ...(permissionResponse?.conditions ?? [])];
      excitements = [
        ...excitements,
        ...(permissionResponse?.excitements ?? []),
      ];
      worries = [...worries, ...(permissionResponse?.worries ?? [])];
    });

    let templateName: UserNotificationTemplateName;
    if (resolveStatus === PermissionRequestResolveStatus.resolveAccepted) {
      templateName =
        UserNotificationTemplateName.spaceEventPermissionRequestResolveAccepted;
      await this.spaceEventService.updateToPermissionGranted(spaceEventId);
    } else if (
      [
        PermissionRequestResolveStatus.resolveCancelled,
        PermissionRequestResolveStatus.resolveDropped,
      ].includes(resolveStatus) === true
    ) {
    }

    switch (resolveStatus) {
      case PermissionRequestResolveStatus.resolveAccepted:
        templateName =
          UserNotificationTemplateName.spaceEventPermissionRequestResolveAccepted;
        await this.spaceEventService.updateToPermissionGranted(spaceEventId);
        break;
      case PermissionRequestResolveStatus.resolveCancelled:
        templateName =
          UserNotificationTemplateName.spaceEventPermissionRequestResolveCancelled;
        await this.spaceEventService.updateToCancelled(spaceEventId);

        break;
      case PermissionRequestResolveStatus.resolveDropped:
        templateName =
          UserNotificationTemplateName.spaceEventPermissionRequestResolveDropped;
        await this.spaceEventService.updateToCancelled(spaceEventId);

        break;
      default:
        break;
    }

    // insert userNotifications
    try {
      // userNotification for permissionRequest creater
      await this.userNotificationService
        .create({
          userId: permissionRequest.userId,
          target: UserNotificationTarget.general,
          type: UserNotificationType.external,
          templateName,
          params: {
            permissionRequestId: permissionRequest.id,
            permissionRequestStatus: status,
            permissionRequestResolveStatus: resolveStatus,
            conditions,
            excitements,
            worries,
          },
        })
        .catch((error) => {
          throw new Error(
            `Failed to create userNotification: ${error.message}`,
          );
        });
      // userNotification for spacePermissioners
      notificationTargetSpacePermissioners.forEach(
        async (spacePermissioner) => {
          await this.userNotificationService
            .create({
              userId: spacePermissioner.userId,
              target: UserNotificationTarget.general,
              type: UserNotificationType.external,
              templateName, // TODO. assign appropriate template for permissioners
              params: {
                permissionRequestId: permissionRequest.id,
                permissionRequestStatus: status,
                permissionRequestResolveStatus: resolveStatus,
                conditions,
                excitements,
                worries,
              },
            })
            .catch((error) => {
              throw new Error(
                `Failed to create userNotification: ${error.message}`,
              );
            });
        },
      );
    } catch (error) {
      this.logger.error(error.message, error);
    }
  }
}
