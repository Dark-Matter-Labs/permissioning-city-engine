import { Injectable } from '@nestjs/common';
import {
  ApprovePermissionResponseDto,
  CreatePermissionResponseDto,
  FindAllPermissionResponseDto,
  RejectPermissionResponseDto,
  UpdatePermissionResponseDto,
} from './dto';
import { PermissionResponse } from 'src/database/entity/permission-response.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
  PermissionResponseStatus,
  PermissionResponseVoteDecision,
} from 'src/lib/type';

@Injectable()
export class PermissionResponseService {
  constructor(
    @InjectRepository(PermissionResponse)
    private permissionResponseRepository: Repository<PermissionResponse>,
  ) {}

  async findAll(
    findAllPermissionResponseDto: FindAllPermissionResponseDto,
  ): Promise<{ data: PermissionResponse[]; total: number }> {
    const { page, limit, permissionRequestId, spacePermissionerIds, statuses } =
      findAllPermissionResponseDto;

    const where = [];
    const params: any[] = [(page - 1) * limit, limit];
    let paramIndex: number = params.length;

    if (permissionRequestId != null) {
      paramIndex++;
      where.push(`permission_request_id = $${paramIndex}`);
      params.push(permissionRequestId);
    }

    if (spacePermissionerIds != null) {
      paramIndex++;
      where.push(`space_permissioner_id = ANY($${paramIndex})`);
      params.push(spacePermissionerIds);
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
          pr.id,
          pr.permission_request_id,
          pr.space_permissioner_id,
          pr.status,
          pr.conditions,
          pr.excitements,
          pr.worries,
          pr.vote_history,
          pr.timeout_at,
          pr.created_at,
          pr.updated_at,
          u.id as user_id,
          u.image as user_image,
          u.name as user_name,
          u.type as user_type,
          u.details as user_details
        FROM permission_response pr
        LEFT JOIN space_permissioner sp ON pr.space_permissioner_id = sp.id
        LEFT JOIN public.user u ON sp.user_id = u.id
        ${whereClause} ${where.join(' AND ')}
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

    const [{ data, total }] = await this.permissionResponseRepository.query(
      query,
      params,
    );

    let result: PermissionResponse[] = [];

    if (data != null) {
      result = data.map((item) => {
        return {
          id: item.id,
          permissionRequestId: item.permission_request_id,
          spacePermissionerId: item.space_permissioner_id,
          status: item.status,
          conditions: item.conditions,
          excitements: item.excitements,
          worries: item.worries,
          voteHistory: item.vote_history,
          timeoutAt: item.timeout_at,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          user: {
            id: item.user_id,
            image: item.user_image,
            name: item.user_name,
            type: item.user_type,
            details: item.user_details,
          },
        };
      });
    }
    return {
      data: result,
      total: parseInt(total),
    };
  }

  findOneById(id: string): Promise<PermissionResponse> {
    return this.permissionResponseRepository.findOne({
      where: { id },
      relations: ['permissionRequest', 'spacePermissioner'],
    });
  }

  async remove(id: string): Promise<void> {
    await this.permissionResponseRepository.delete(id);
  }

  async create(
    createPermissionResponseDto: CreatePermissionResponseDto,
  ): Promise<PermissionResponse> {
    const permissionResponse = this.permissionResponseRepository.create({
      ...createPermissionResponseDto,
      id: uuidv4(),
      status: PermissionResponseStatus.pending,
    });

    return this.permissionResponseRepository.save(permissionResponse);
  }

  async updateToApproved(
    id: string,
    approvePermissionResponseDto: ApprovePermissionResponseDto,
  ): Promise<{ data: { result: boolean } }> {
    const { conditions } = approvePermissionResponseDto;
    let status = PermissionResponseStatus.approved;

    if (Array.isArray(conditions) && conditions.length > 0) {
      status = PermissionResponseStatus.approvedWithCondition;
    }

    const permissionResponse = await this.findOneById(id);
    const timestamp = new Date();

    const updateResult = await this.permissionResponseRepository.update(id, {
      ...approvePermissionResponseDto,
      status,
      voteHistory: [
        ...(permissionResponse.voteHistory ?? []),
        {
          decision: status as unknown as PermissionResponseVoteDecision,
          timestamp,
        },
      ],
      updatedAt: timestamp,
    });

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }

  async updateToRejected(
    id: string,
    rejectPermissionResponseDto: RejectPermissionResponseDto,
  ): Promise<{ data: { result: boolean } }> {
    const permissionResponse = await this.findOneById(id);
    const timestamp = new Date();

    const updateResult = await this.permissionResponseRepository.update(id, {
      ...rejectPermissionResponseDto,
      status: PermissionResponseStatus.rejected,
      voteHistory: [
        ...(permissionResponse.voteHistory ?? []),
        {
          decision: PermissionResponseVoteDecision.rejected,
          timestamp,
        },
      ],
      updatedAt: timestamp,
    });

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }

  async updateToTimeout(id: string): Promise<{ data: { result: boolean } }> {
    const updateResult = await this.permissionResponseRepository.update(id, {
      status: PermissionResponseStatus.timeout,
      updatedAt: new Date(),
    });

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }

  async updateToAbstention(
    id: string,
    updatePermissionResponseDto: UpdatePermissionResponseDto,
  ): Promise<{ data: { result: boolean } }> {
    const permissionResponse = await this.findOneById(id);
    const timestamp = new Date();

    const updateResult = await this.permissionResponseRepository.update(id, {
      ...updatePermissionResponseDto,
      status: PermissionResponseStatus.abstention,
      voteHistory: [
        ...(permissionResponse.voteHistory ?? []),
        {
          decision: PermissionResponseVoteDecision.abstention,
          timestamp,
        },
      ],
      updatedAt: timestamp,
    });

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }
}
