import { Injectable } from '@nestjs/common';
import { CreatePermissionRequestDto } from './dto';
import { PermissionRequest } from 'src/database/entity/permission-request.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionRequestStatus } from 'src/lib/type';

@Injectable()
export class PermissionRequestService {
  constructor(
    @InjectRepository(PermissionRequest)
    private permissionRequestRepository: Repository<PermissionRequest>,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    spaceEventId: string | null = null,
    spaceId: string | null = null,
    ruleId: string | null = null,
    statuses: PermissionRequestStatus[] | null = null,
  ): Promise<{ data: PermissionRequest[]; total: number }> {
    const where = [];
    const params: any[] = [(page - 1) * limit, limit];
    let paramIndex: number = params.length;

    if (spaceEventId !== null) {
      paramIndex++;
      where.push(`space_event_id = $${paramIndex}`);
      params.push(spaceEventId);
    }

    if (spaceId !== null) {
      paramIndex++;
      where.push(`space_id = $${paramIndex}`);
      params.push(spaceId);
    }

    if (ruleId !== null) {
      paramIndex++;
      where.push(`rule_id = $${paramIndex}`);
      params.push(ruleId);
    }

    if (statuses !== null) {
      paramIndex++;
      where.push(`status IN $${paramIndex}`);
      params.push(statuses);
    }

    const query = `
      WITH filtered_data AS (
        SELECT (
          id,
          space_id,
          space_event_id,
          space_rule_id,
          space_event_rule_id,
          status,
          created_at,
          updated_at
        ) FROM permission_request
        WHERE ${where.join(' AND ')}
      )
      SELECT COUNT(*) AS total, json_agg(filtered_data) AS data
      FROM filtered_data
      LIMIT $2 OFFSET $1;
    `;

    return await this.permissionRequestRepository.query(query, params);
  }

  findOneById(id: string): Promise<PermissionRequest> {
    return this.permissionRequestRepository.findOneBy({ id });
  }

  async remove(id: string): Promise<void> {
    await this.permissionRequestRepository.delete(id);
  }

  create(
    createPermissionRequestDto: CreatePermissionRequestDto,
  ): Promise<PermissionRequest> {
    const permissionRequest = this.permissionRequestRepository.create(
      createPermissionRequestDto,
    );

    return this.permissionRequestRepository.save(permissionRequest);
  }
}
