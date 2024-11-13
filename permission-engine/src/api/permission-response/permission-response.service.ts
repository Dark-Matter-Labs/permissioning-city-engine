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
import { PermissionResponseStatus } from 'src/lib/type';

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
          id,
          permission_request_id,
          space_permissioner_id,
          status,
          conditions,
          excitements,
          worries,
          timeout_at,
          created_at,
          updated_at
        FROM permission_response
        ${whereClause} ${where.join(' AND ')}
      )
      SELECT COUNT(*) AS total, json_agg(filtered_data) AS data
      FROM filtered_data
      LIMIT $2 OFFSET $1;
    `;

    const [{ data, total }] = await this.permissionResponseRepository.query(
      query,
      params,
    );

    let result = [];

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
          timeoutAt: item.timeout_at,
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

  // TODO. add permission-handler logic
  async updateToApproved(
    id: string,
    approvePermissionResponseDto: ApprovePermissionResponseDto,
  ): Promise<{ data: { result: boolean } }> {
    const { conditions } = approvePermissionResponseDto;
    let status = PermissionResponseStatus.approved;

    if (Array.isArray(conditions) && conditions.length > 0) {
      status = PermissionResponseStatus.approvedWithCondition;
    }

    const updateResult = await this.permissionResponseRepository.update(id, {
      ...approvePermissionResponseDto,
      status,
      updatedAt: new Date(),
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
    const updateResult = await this.permissionResponseRepository.update(id, {
      ...rejectPermissionResponseDto,
      status: PermissionResponseStatus.rejected,
      updatedAt: new Date(),
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
    const updateResult = await this.permissionResponseRepository.update(id, {
      ...updatePermissionResponseDto,
      status: PermissionResponseStatus.abstention,
      updatedAt: new Date(),
    });

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }
}
