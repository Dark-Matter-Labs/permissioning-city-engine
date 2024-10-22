import { Injectable } from '@nestjs/common';
import { CreatePermissionRequestDto, FindAllPermissionRequestDto } from './dto';
import { PermissionRequest } from 'src/database/entity/permission-request.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { Space } from 'src/database/entity/space.entity';
import { SpaceEvent } from 'src/database/entity/space-event.entity';
import { v4 as uuidv4 } from 'uuid';
import {
  PermissionRequestResolveStatus,
  PermissionRequestStatus,
} from 'src/lib/type';
import * as Util from 'src/lib/util/util';

@Injectable()
export class PermissionRequestService {
  constructor(
    @InjectRepository(PermissionRequest)
    private permissionRequestRepository: Repository<PermissionRequest>,
    @InjectRepository(Space)
    private spaceRepository: Repository<Space>,
    @InjectRepository(SpaceEvent)
    private spaceEventRepository: Repository<SpaceEvent>,
  ) {}

  async findAll(
    findAllPermissionRequestDto: FindAllPermissionRequestDto,
  ): Promise<{ data: PermissionRequest[]; total: number }> {
    const { page, limit, spaceEventId, spaceId, ruleId, statuses } =
      findAllPermissionRequestDto;

    const where = [];
    const params: any[] = [(page - 1) * limit, limit];
    let paramIndex: number = params.length;

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
          created_at,
          updated_at
        FROM permission_request
        ${whereClause} ${where.join(' AND ')}
      )
      SELECT COUNT(*) AS total, json_agg(filtered_data) AS data
      FROM filtered_data
      LIMIT $2 OFFSET $1;
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

  async remove(id: string): Promise<void> {
    await this.permissionRequestRepository.delete(id);
  }

  async create(
    createPermissionRequestDto: CreatePermissionRequestDto,
  ): Promise<PermissionRequest> {
    const { spaceId, spaceRuleId, spaceEventId } = createPermissionRequestDto;
    const dto: Partial<PermissionRequest> = createPermissionRequestDto;

    // set rule ids
    if (!spaceRuleId) {
      const space = await this.spaceRepository.findOneBy({ id: spaceId });
      createPermissionRequestDto.spaceRuleId = space.ruleId;
    }

    if (spaceEventId) {
      const spaceEvent = await this.spaceEventRepository.findOneBy({
        id: spaceEventId,
      });

      dto.spaceEventRuleId = spaceEvent.ruleId;
    }

    const permissionRequest = this.permissionRequestRepository.create({
      ...dto,
      id: uuidv4(),
    });

    return this.permissionRequestRepository.save(permissionRequest);
  }

  updateToAssigned(id: string): Promise<UpdateResult> {
    return this.permissionRequestRepository.update(id, {
      status: PermissionRequestStatus.assigned,
      updatedAt: new Date(),
    });
  }

  updateToAssignFailed(id: string): Promise<UpdateResult> {
    return this.permissionRequestRepository.update(id, {
      status: PermissionRequestStatus.assignFailed,
      updatedAt: new Date(),
    });
  }

  updateToIssueRaised(id: string): Promise<UpdateResult> {
    return this.permissionRequestRepository.update(id, {
      status: PermissionRequestStatus.issueRaised,
      updatedAt: new Date(),
    });
  }

  updateToReviewApproved(id: string): Promise<UpdateResult> {
    return this.permissionRequestRepository.update(id, {
      status: PermissionRequestStatus.reviewApproved,
      updatedAt: new Date(),
    });
  }

  updateToReviewApprovedWithCondition(id: string): Promise<UpdateResult> {
    return this.permissionRequestRepository.update(id, {
      status: PermissionRequestStatus.reviewApprovedWithCondition,
      updatedAt: new Date(),
    });
  }

  updateToResolveCancelled(id: string): Promise<UpdateResult> {
    return this.permissionRequestRepository.update(id, {
      resolveStatus: PermissionRequestResolveStatus.resolveCancelled,
      updatedAt: new Date(),
    });
  }

  // only for review_approved* status
  updateToResolveRejected(id: string): Promise<UpdateResult> {
    return this.permissionRequestRepository.update(id, {
      resolveStatus: PermissionRequestResolveStatus.resolveRejected,
      updatedAt: new Date(),
    });
  }

  async updateToResolveAccepted(
    id: string,
  ): Promise<{ data: { permissionCode: string } }> {
    const permissionCode = Util.generateRandomCode();
    await this.permissionRequestRepository.update(id, {
      resolveStatus: PermissionRequestResolveStatus.resolveAccepted,
      permissionCode,
      updatedAt: new Date(),
    });

    return {
      data: {
        permissionCode,
      },
    };
  }

  updateToResolveDropped(id: string): Promise<UpdateResult> {
    return this.permissionRequestRepository.update(id, {
      resolveStatus: PermissionRequestResolveStatus.resolveDropped,
      updatedAt: new Date(),
    });
  }
}
