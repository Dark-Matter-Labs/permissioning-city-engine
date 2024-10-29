import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import {
  PermissionProcessType,
  PermissionRequestResolveStatus,
  PermissionRequestStatus,
  PermissionRequestTarget,
  PermissionResponseStatus,
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

@Processor('permission-handler')
export class PermissionHandlerProcessor {
  constructor(
    private readonly spaceService: SpaceService,
    private readonly spaceEventService: SpaceEventService,
    private readonly userNotificationService: UserNotificationService,
    private readonly spacePermissionerService: SpacePermissionerService,
    private readonly permissionResponseService: PermissionResponseService,
    private readonly permissionRequestService: PermissionRequestService,
    private readonly ruleService: RuleService,
    private readonly logger: Logger,
  ) {}

  @Process({ concurrency: 1 })
  async handlePermissionProcess(job: Job<any>) {
    if (process.env.ENGINE_MODE !== 'daemon') {
      return;
    }
    this.logger.log('Handling permission:', job.data);
    // Job processing logic
    await new Promise<void>(async (resolve, reject) => {
      try {
        switch (job.data.permissionProcessType) {
          case PermissionProcessType.spaceEventPermissionRequestCreated:
            await this.spaceEventPermissionRequestCreated(job.data);
            break;
          case PermissionProcessType.spaceRuleChangePermissionRequestCreated:
            await this.spaceRuleChangePermissionRequestCreated(job.data);
            break;
          case PermissionProcessType.spaceEventRulePreApprovePermissionRequestCreated:
            await this.spaceEventRulePreApprovePermissionRequestCreated(
              job.data,
            );
            break;
          case PermissionProcessType.permissionResponseReviewed:
            await this.permissionResponseReviewed(job.data);
            break;
          case PermissionProcessType.permissionResponseReviewCompleted:
            await this.permissionResponseReviewCompleted(job.data);
            break;
          case PermissionProcessType.permissionRequestResolved:
            await this.permissionRequestResolved(job.data);
            break;

          default:
            break;
        }
        resolve();
      } catch (error) {
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
   */
  async spaceEventPermissionRequestCreated(option: {
    permissionRequestId: string;
  }) {
    const { permissionRequestId } = option;
    const permissionRequest =
      await this.permissionRequestService.findOneById(permissionRequestId);
    const spacePermissioners =
      await this.spacePermissionerService.findAllBySpaceId(
        permissionRequest.spaceId,
        { isActive: true },
        false,
      );

    // TODO. apply dynamic timeout value
    const timeoutAt = dayjs(permissionRequest.createdAt).add(1, 'day').toDate();

    await this.userNotificationService
      .create({
        userId: permissionRequest.spaceEvent.organizerId,
        target: UserNotificationTarget.general,
        type: UserNotificationType.external,
        templateName:
          UserNotificationTemplateName.spaceEventPermissionRequested,
        params: {
          permissionRequestId,
          spaceRuleId: permissionRequest.spaceRule.id,
          spaceRuleName: permissionRequest.spaceRule.name,
          spaceEventId: permissionRequest.spaceEvent.id,
          spaceEventName: permissionRequest.spaceEvent.name,
          spaceEventStartsAt: permissionRequest.spaceEvent.startsAt,
          spaceEventDuration: permissionRequest.spaceEvent.duration,
          spaceEventRuleId: permissionRequest.spaceEventRule.id,
          spaceEventRuleName: permissionRequest.spaceEventRule.name,
        },
      })
      .catch((error) => {
        throw new Error(`Failed to create userNotification: ${error.message}`);
      });
    const notificationTargetSpacePermissioners =
      spacePermissioners?.data?.filter((spacePermissioner) => {
        return spacePermissioner.userId !== permissionRequest.userId;
      });
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
              UserNotificationTemplateName.spaceEventPermissionRequested,
            params: {
              permissionRequestId,
              spaceRuleId: permissionRequest.spaceRule.id,
              spaceRuleName: permissionRequest.spaceRule.name,
              spaceEventId: permissionRequest.spaceEvent.id,
              spaceEventName: permissionRequest.spaceEvent.name,
              spaceEventStartsAt: permissionRequest.spaceEvent.startsAt,
              spaceEventDuration: permissionRequest.spaceEvent.duration,
              spaceEventRuleId: permissionRequest.spaceEventRule.id,
              spaceEventRuleName: permissionRequest.spaceEventRule.name,
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
        false,
      );

    // TODO. apply dynamic timeout value
    const timeoutAt = dayjs(permissionRequest.createdAt).add(1, 'day').toDate();

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
    const spaceEventRule = await this.ruleService.findOneById(
      permissionRequest.spaceEventRuleId,
    );
    const spacePermissioners =
      await this.spacePermissionerService.findAllBySpaceId(
        permissionRequest.spaceId,
        { isActive: true },
        false,
      );

    // TODO. apply dynamic timeout value
    const timeoutAt = dayjs(permissionRequest.createdAt).add(1, 'day').toDate();

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
    const { timeoutAt } = permissionResponses[0];
    const reviewedResponses = permissionResponses.filter(
      (item) => item.status !== PermissionResponseStatus.pending,
    );
    const spacePermissioners =
      await this.spacePermissionerService.findAllBySpaceId(
        permissionRequest.spaceId,
        { isActive: true },
        false,
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
    const [operator, percent, flag] = consentMethod.content.split('_');
    const oldSpaceRuleId = permissionRequest.space.ruleId;
    const newSpaceRuleId = permissionRequest.spaceRuleId;

    const permissionRequestType =
      oldSpaceRuleId === newSpaceRuleId
        ? PermissionRequestTarget.spaceEvent
        : PermissionRequestTarget.spaceRule;

    const isResolveReady =
      spacePermissioners.total === reviewedResponses.length ||
      dayjs(timeoutAt) <= dayjs();

    // Everyone reviewed: can resolve
    if (isResolveReady === true) {
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
            result = new BigNumber(a).gte(b);
            break;
          case 'under':
            result = new BigNumber(a).lte(b);
            break;
          case 'is':
            result = new BigNumber(a).eq(b);
            break;
          default:
            break;
        }

        return result;
      }

      if (flag === 'yes') {
        const approvedPercent = new BigNumber(approvedResponses.length)
          .plus(approvedWithConditionResponses.length)
          .div(reviewedResponses.length)
          .times(100)
          .toString();
        isConsent = comparePercent(operator, approvedPercent, percent);
      } else if (flag == 'no') {
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
      if (isConsent === true && approvedWithConditionResponses.length === 0) {
        permissionRequestStatus = PermissionRequestStatus.reviewApproved;
        await this.permissionRequestService.updateToReviewApproved(
          permissionRequest.id,
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

      reviewedResponses.forEach((permissionResponse) => {
        conditions = [...conditions, ...permissionResponse.conditions];
        excitements = [...excitements, ...permissionResponse.excitements];
        worries = [...worries, ...permissionResponse.worries];
      });

      // resolve if spaceRule update permission request
      // resolve if spaceEvent permission request rejected
      if (permissionRequestType === PermissionRequestTarget.spaceRule) {
        if (isConsent === true) {
          permissionRequestResolveStatus =
            PermissionRequestResolveStatus.resolveAccepted;
          await this.permissionRequestService.updateToResolveAccepted(
            permissionRequest.id,
            true,
          );
          await this.spaceService.update(permissionRequest.spaceId, {
            ruleId: permissionRequest.spaceRuleId,
          });
        } else {
          permissionRequestResolveStatus =
            PermissionRequestResolveStatus.resolveRejected;
          await this.permissionRequestService.updateToResolveRejected(
            permissionRequest.id,
            true,
          );
        }
      } else if (permissionRequestType === PermissionRequestTarget.spaceEvent) {
        if (isConsent === false) {
          permissionRequestResolveStatus =
            PermissionRequestResolveStatus.resolveRejected;
          await this.permissionRequestService.updateToResolveRejected(
            permissionRequest.id,
            true,
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
            templateName:
              permissionRequestResolveStatus !== null
                ? UserNotificationTemplateName.permissionRequestResolved
                : UserNotificationTemplateName.permissionRequestReviewed,
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
                templateName:
                  permissionRequestResolveStatus !== null
                    ? UserNotificationTemplateName.permissionRequestResolved
                    : UserNotificationTemplateName.permissionRequestReviewed,
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
        false,
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
      conditions = [...conditions, ...permissionResponse.conditions];
      excitements = [...excitements, ...permissionResponse.excitements];
      worries = [...worries, ...permissionResponse.worries];
    });

    if (resolveStatus === PermissionRequestResolveStatus.resolveAccepted) {
      await this.spaceEventService.updateToPermissionGranted(spaceEventId);
    } else if (
      [
        PermissionRequestResolveStatus.resolveCancelled,
        PermissionRequestResolveStatus.resolveDropped,
      ].includes(resolveStatus) === true
    ) {
      await this.spaceEventService.updateToCancelled(spaceEventId);
    }

    // insert userNotifications
    try {
      // userNotification for permissionRequest creater
      await this.userNotificationService
        .create({
          userId: permissionRequest.userId,
          target: UserNotificationTarget.general,
          type: UserNotificationType.external,
          templateName: UserNotificationTemplateName.permissionRequestResolved,
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
              templateName:
                UserNotificationTemplateName.permissionRequestResolved,
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
