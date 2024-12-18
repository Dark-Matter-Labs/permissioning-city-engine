import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  PermissionProcessType,
  PermissionRequestResolveStatus,
  TimeSortBy,
  PermissionRequestStatus,
} from 'src/lib/type';
import {
  CancelPermissionRequestDto,
  CreatePermissionRequestDto,
  DropPermissionRequestDto,
  FindAllPermissionRequestByTimeoutDto,
  FindAllPermissionRequestDto,
} from './dto';
import { PermissionRequest } from 'src/database/entity/permission-request.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { Space } from 'src/database/entity/space.entity';
import { SpaceEvent } from 'src/database/entity/space-event.entity';
import { generateRandomCode } from 'src/lib/util';
import { Logger } from 'src/lib/logger/logger.service';
import { PermissionHandlerService } from 'src/lib/permission-handler/permission-handler.service';
import { RuleService } from '../rule/rule.service';
import dayjs from 'dayjs';

@Injectable()
export class PermissionRequestService {
  constructor(
    @InjectRepository(PermissionRequest)
    private permissionRequestRepository: Repository<PermissionRequest>,
    @InjectRepository(Space)
    private spaceRepository: Repository<Space>,
    @InjectRepository(SpaceEvent)
    private spaceEventRepository: Repository<SpaceEvent>,
    @Inject(forwardRef(() => PermissionHandlerService))
    private readonly permissionHandlerService: PermissionHandlerService,
    private readonly ruleService: RuleService,
    private readonly logger: Logger,
  ) {}

  async findAll(
    findAllPermissionRequestDto: FindAllPermissionRequestDto,
  ): Promise<{ data: PermissionRequest[]; total: number }> {
    const {
      page,
      limit,
      spaceEventId,
      spaceId,
      ruleId,
      statuses,
      createdBefore,
      resolveStatuses,
      sortBy,
    } = findAllPermissionRequestDto;

    const where = [];
    const params: any[] = [(page - 1) * limit, limit];
    let paramIndex: number = params.length;
    let orderByClause = '';

    if (spaceEventId != null) {
      paramIndex++;
      where.push(`space_event_id = $${paramIndex}`);
      params.push(spaceEventId);
    }

    if (spaceId != null) {
      paramIndex++;
      where.push(`space_id = $${paramIndex}`);
      params.push(spaceId);
    }

    if (ruleId != null) {
      paramIndex++;
      where.push(`rule_id = $${paramIndex}`);
      params.push(ruleId);
    }

    if (statuses != null) {
      paramIndex++;
      where.push(`status = ANY($${paramIndex})`);
      params.push(statuses);
    }

    if (resolveStatuses != null) {
      paramIndex++;
      where.push(`resolve_status = ANY($${paramIndex})`);
      params.push(resolveStatuses);
    }

    if (createdBefore != null) {
      paramIndex++;
      where.push(`created_at <= $${paramIndex}`);
      params.push(createdBefore);
    }

    if (sortBy != null) {
      switch (sortBy) {
        case TimeSortBy.timeDesc:
          orderByClause = `ORDER BY created_at DESC`;
          break;
        case TimeSortBy.timeAsc:
        default:
          orderByClause = `ORDER BY created_at ASC`;
          break;
      }
    }

    const whereClause = where.length > 0 ? 'WHERE' : '';
    const query = `
      WITH filtered_data AS (
        SELECT 
          id,
          space_id,
          space_event_id,
          space_rule_id,
          space_event_rule_id,
          status,
          resolve_status,
          process_type,
          created_at,
          updated_at
        FROM permission_request
        ${whereClause} ${where.join(' AND ')}
        ${orderByClause}
      ),
      paginated_data AS (
        SELECT * FROM filtered_data
        LIMIT $2 OFFSET $1
      )
      SELECT 
        (SELECT COUNT(*) FROM filtered_data) AS total,
        json_agg(paginated_data) AS data
      FROM paginated_data;
    `;

    const [{ data, total }] = await this.permissionRequestRepository.query(
      query,
      params,
    );

    let result = [];

    if (data != null) {
      result = data.map((item) => {
        return {
          id: item.id,
          spaceId: item.space_id,
          spaceEventId: item.space_event_id,
          spaceRuleId: item.space_rule_id,
          spaceEventRuleId: item.space_event_rule_id,
          status: item.status,
          resolveStatus: item.resolve_status,
          processType: item.process_type,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        };
      });
    }
    return {
      data: result,
      total: parseInt(total),
    };
  }

  async findAllByTimeout(
    findAllPermissionRequestByTimeoutDto: FindAllPermissionRequestByTimeoutDto,
  ) {
    const { timeout, page, limit } = findAllPermissionRequestByTimeoutDto;
    const params: any[] = [(page - 1) * limit, limit, timeout];
    const query = `
      WITH filtered_data AS (
        SELECT 
          preq.id,
          preq.space_id,
          preq.space_event_id,
          preq.space_rule_id,
          preq.space_event_rule_id,
          preq.status,
          preq.resolve_status,
          preq.created_at,
          preq.updated_at
        FROM permission_request preq, permission_response pres
        WHERE
          preq.id = pres.permission_request_id
        AND
          preq.status = 'assigned'
        AND
          pres.timeout_at <= $3
        GROUP BY preq.id
      ),
      paginated_data AS (
        SELECT * FROM filtered_data
        LIMIT $2 OFFSET $1
      )
      SELECT 
        (SELECT COUNT(*) FROM filtered_data) AS total,
        json_agg(paginated_data) AS data
      FROM paginated_data;
    `;

    const [{ data, total }] = await this.permissionRequestRepository.query(
      query,
      params,
    );

    let result = [];

    if (data != null) {
      result = data.map((item) => {
        return {
          id: item.id,
          spaceId: item.space_id,
          spaceEventId: item.space_event_id,
          spaceRuleId: item.space_rule_id,
          spaceEventRuleId: item.space_event_rule_id,
          status: item.status,
          resolveStatus: item.resolve_status,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        };
      });
    }
    return {
      data: result,
      total: parseInt(total),
    };
  }

  async findAllPending(limit: number = 100): Promise<PermissionRequest[]> {
    return await this.permissionRequestRepository.find({
      where: [
        {
          status: PermissionRequestStatus.pending,
        },
        {
          status: PermissionRequestStatus.queued,
          createdAt: LessThanOrEqual(dayjs().subtract(30, 's').toDate()),
        },
      ],
      order: {
        createdAt: 'ASC',
      },
      take: limit,
    });
  }

  findOneById(id: string): Promise<PermissionRequest> {
    return this.permissionRequestRepository.findOne({
      where: { id },
      relations: [
        'spaceEvent',
        'spaceEventRule',
        'space',
        'spaceRule',
        'permissionResponses',
      ],
    });
  }

  findOneByPermissionCode(permissionCode: string): Promise<PermissionRequest> {
    return this.permissionRequestRepository.findOne({
      where: { permissionCode },
      relations: [
        'spaceEvent',
        'spaceEventRule',
        'space',
        'spaceRule',
        'permissionResponses',
      ],
    });
  }

  async remove(id: string): Promise<void> {
    await this.permissionRequestRepository.delete(id);
  }

  async create(
    userId: string,
    createPermissionRequestDto: Partial<CreatePermissionRequestDto>,
  ): Promise<{
    data: { result: boolean; permissionRequest: PermissionRequest | null };
  }> {
    const { spaceId, spaceRuleId, spaceEventId, spaceEventRuleId } =
      createPermissionRequestDto;
    const dto: Partial<PermissionRequest> = createPermissionRequestDto;
    let permissionProcessType =
      PermissionProcessType.spaceEventPermissionRequestCreated;

    // set rule ids
    if (!spaceRuleId) {
      const space = await this.spaceRepository.findOneBy({ id: spaceId });
      createPermissionRequestDto.spaceRuleId = space.ruleId;
    } else {
      permissionProcessType =
        PermissionProcessType.spaceRuleChangePermissionRequestCreated;
    }

    if (spaceEventId) {
      const spaceEvent = await this.spaceEventRepository.findOneBy({
        id: spaceEventId,
      });

      dto.spaceEventRuleId = spaceEvent.ruleId;
    } else if (spaceEventRuleId) {
      permissionProcessType =
        PermissionProcessType.spaceEventRulePreApprovePermissionRequestCreated;
    }

    const permissionRequest = this.permissionRequestRepository.create({
      ...dto,
      userId,
      processType: permissionProcessType,
      id: uuidv4(),
    });

    let result = true;

    try {
      await this.permissionRequestRepository.save(permissionRequest);
    } catch (error) {
      this.logger.error('Failed to create permissionRequest', error);
      result = false;
    }

    return {
      data: {
        result,
        permissionRequest: result ? permissionRequest : null,
      },
    };
  }

  async updateSpaceEventRuleId(
    id: string,
    spaceEventRuleId: string,
  ): Promise<{ data: { result: boolean } }> {
    const updateResult = await this.permissionRequestRepository.update(id, {
      spaceEventRuleId,
      updatedAt: new Date(),
    });

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }

  async updateToQueued(id: string): Promise<{ data: { result: boolean } }> {
    const updateResult = await this.permissionRequestRepository.update(id, {
      status: PermissionRequestStatus.queued,
      updatedAt: new Date(),
    });

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }

  async updateToAssigned(id: string): Promise<{ data: { result: boolean } }> {
    const updateResult = await this.permissionRequestRepository.update(id, {
      status: PermissionRequestStatus.assigned,
      updatedAt: new Date(),
    });

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }

  async updateToAssignFailed(
    id: string,
  ): Promise<{ data: { result: boolean } }> {
    const updateResult = await this.permissionRequestRepository.update(id, {
      status: PermissionRequestStatus.assignFailed,
      updatedAt: new Date(),
    });

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }

  async updateToReviewApproved(
    id: string,
  ): Promise<{ data: { result: boolean } }> {
    const updateResult = await this.permissionRequestRepository.update(id, {
      status: PermissionRequestStatus.reviewApproved,
      updatedAt: new Date(),
    });

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }

  async updateToReviewApprovedWithCondition(
    id: string,
  ): Promise<{ data: { result: boolean } }> {
    const updateResult = await this.permissionRequestRepository.update(id, {
      status: PermissionRequestStatus.reviewApprovedWithCondition,
      updatedAt: new Date(),
    });

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }

  async updateToReviewRejected(
    id: string,
  ): Promise<{ data: { result: boolean } }> {
    const updateResult = await this.permissionRequestRepository.update(id, {
      status: PermissionRequestStatus.reviewRejected,
      updatedAt: new Date(),
    });

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }

  async updateToResolveCancelled(
    id: string,
    cancelPermissionRequestDto: CancelPermissionRequestDto,
  ): Promise<{ data: { result: boolean } }> {
    const { resolveDetails } = cancelPermissionRequestDto;
    const updateResult = await this.permissionRequestRepository.update(id, {
      resolveStatus: PermissionRequestResolveStatus.resolveCancelled,
      resolveDetails,
      updatedAt: new Date(),
    });

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }

  async updateToResolveRejected(
    id: string,
    option: { isForce: boolean } = { isForce: false },
  ): Promise<{ data: { result: boolean } }> {
    const dto: Partial<PermissionRequest> = {
      resolveStatus: PermissionRequestResolveStatus.resolveRejected,
      updatedAt: new Date(),
    };
    const { isForce } = option;

    if (isForce === true) {
      dto.status = PermissionRequestStatus.reviewRejected;
    }

    const updateResult = await this.permissionRequestRepository.update(id, dto);

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }

  async updateToResolveAccepted(
    id: string,
    option: { isForce: boolean } = { isForce: false },
  ): Promise<{ data: { result: boolean; permissionCode: string | null } }> {
    const permissionCode = generateRandomCode();
    const dto: Partial<PermissionRequest> = {
      resolveStatus: PermissionRequestResolveStatus.resolveAccepted,
      permissionCode,
      updatedAt: new Date(),
    };
    const { isForce } = option;

    if (isForce === true) {
      dto.status = PermissionRequestStatus.reviewApproved;
    }

    const updateResult = await this.permissionRequestRepository.update(id, dto);
    const result = updateResult.affected === 1;

    return {
      data: {
        result,
        permissionCode: result === true ? permissionCode : null,
      },
    };
  }

  // only for review_approved* status
  async updateToResolveDropped(
    id: string,
    dropPermissionRequestDto: DropPermissionRequestDto,
  ): Promise<{ data: { result: boolean } }> {
    const { resolveDetails } = dropPermissionRequestDto;
    const updateResult = await this.permissionRequestRepository.update(id, {
      resolveStatus: PermissionRequestResolveStatus.resolveDropped,
      resolveDetails,
      updatedAt: new Date(),
    });

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }
}
