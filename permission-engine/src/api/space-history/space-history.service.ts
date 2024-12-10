import { Injectable } from '@nestjs/common';
import {
  CreateSpaceHistoryDto,
  FindAllSpaceHistoryDto,
  FindAllIssueSpaceHistoryDto,
} from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsWhere, In, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { SpaceHistory } from 'src/database/entity/space-history.entity';
import { SpaceHistoryType } from 'src/lib/type';

@Injectable()
export class SpaceHistoryService {
  constructor(
    @InjectRepository(SpaceHistory)
    private spaceHistoryRepository: Repository<SpaceHistory>,
  ) {}

  async findAll(
    findAllSpaceHistoryDto: FindAllSpaceHistoryDto,
    option: { isPagination: boolean } = { isPagination: true },
  ): Promise<{ data: SpaceHistory[]; total: number }> {
    const { page, limit, spaceId, spaceEventId, isPublic, types } =
      findAllSpaceHistoryDto;
    const { isPagination } = option;
    const where: FindOptionsWhere<SpaceHistory> = {};

    if (spaceId != null) {
      where.spaceId = spaceId;
    }

    if (spaceEventId != null) {
      where.spaceEventId = spaceEventId;
    }

    if (types != null) {
      where.type = In(types);
    }

    if (isPublic != null) {
      where.isPublic = isPublic;
    } else {
      where.isPublic = true;
    }

    let queryOption: FindManyOptions<SpaceHistory> = {
      where,
      relations: [
        'space',
        'rule',
        'logger',
        'spacePermissioner',
        'spaceEvent',
        'permissionRequest',
      ],
    };
    if (isPagination === true) {
      queryOption = {
        ...queryOption,
        skip: (page - 1) * limit,
        take: limit,
      };
    }

    const [data, total] =
      await this.spaceHistoryRepository.findAndCount(queryOption);

    return {
      data: data ?? [],
      total: Number(total),
    };
  }

  async findAllIssue(findAllIssueSpaceHistoryDto: FindAllIssueSpaceHistoryDto) {
    const { page, limit, spaceId, spaceEventId, isPublic } =
      findAllIssueSpaceHistoryDto;

    const where = [];
    const params: any[] = [(page - 1) * limit, limit];
    let paramIndex: number = params.length;

    paramIndex++;
    where.push(`shp.type = ANY($${paramIndex})`);
    params.push([
      SpaceHistoryType.spaceIssue,
      SpaceHistoryType.spaceEventCompleteWithIssue,
    ]);

    if (spaceId != null) {
      paramIndex++;
      where.push(`shp.space_id = $${paramIndex}`);
      params.push(spaceId);
    }

    if (spaceEventId != null) {
      paramIndex++;
      where.push(`shp.space_event_id = $${paramIndex}`);
      params.push(spaceEventId);
    }

    if (isPublic != null) {
      paramIndex++;
      where.push(`shp.is_public = $${paramIndex}`);
      params.push(isPublic);
    } else {
      where.push(`shp.is_public = true`);
    }

    const query = `
      WITH filtered_data AS (
        SELECT (
          shp.id,
          shp.space_id,
          shp.rule_id,
          shp.logger_id,
          shp.space_history_id,
          shp.space_permissioner_id,
          shp.space_event_id,
          shp.permission_request_id,
          shp.is_public,
          shp.type,
          shp.title,
          shp.details,
          shp.image,
          shp.created_at,
          ARRAY_AGG(shc)
        ) FROM space_history shp
        LEFT JOIN space_history shc
        ON shp.id = shc.space_history_id
        WHERE ${where.join(' AND ')}
        GROUP BY shp.id
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

    const [{ data, total }] = await this.spaceHistoryRepository.query(
      query,
      params,
    );

    let result = [];

    if (data != null) {
      result = data.map((item) => {
        const children = item.row.f15;
        return {
          id: item.row.f1,
          spaceId: item.row.f2,
          ruleId: item.row.f3,
          loggerId: item.row.f4,
          spaceHistoryId: item.row.f5,
          spacePermissionerId: item.row.f6,
          spaceEventId: item.row.f7,
          permissionRequestId: item.row.f8,
          isPublic: item.row.f9,
          type: item.row.f10,
          title: item.row.f11,
          details: item.row.f12,
          image: item.row.f13,
          createdAt: item.row.f14,
          children: children[0] === null ? [] : children,
        };
      });
    }

    return {
      data: result,
      total: Number(total),
    };
  }

  async findAllUnResolvedIssue(
    findAllIssueSpaceHistoryDto: FindAllIssueSpaceHistoryDto,
  ) {
    const { page, limit, spaceId, spaceEventId, isPublic } =
      findAllIssueSpaceHistoryDto;

    const where = [];
    const params: any[] = [(page - 1) * limit, limit];
    let paramIndex: number = params.length;

    paramIndex++;
    params.push(SpaceHistoryType.spaceIssueResolve);

    paramIndex++;
    where.push(`shp.type = ANY($${paramIndex})`);
    params.push([
      SpaceHistoryType.spaceIssue,
      SpaceHistoryType.spaceEventCompleteWithIssue,
    ]);

    if (spaceId != null) {
      paramIndex++;
      where.push(`shp.space_id = $${paramIndex}`);
      params.push(spaceId);
    }

    if (spaceEventId != null) {
      paramIndex++;
      where.push(`shp.space_event_id = $${paramIndex}`);
      params.push(spaceEventId);
    }

    if (isPublic != null) {
      paramIndex++;
      where.push(`shp.is_public = $${paramIndex}`);
      params.push(isPublic);
    } else {
      where.push(`shp.is_public = true`);
    }

    const query = `
      WITH filtered_data AS (
        SELECT (
          shp.id,
          shp.space_id,
          shp.rule_id,
          shp.logger_id,
          shp.space_history_id,
          shp.space_permissioner_id,
          shp.space_event_id,
          shp.permission_request_id,
          shp.is_public,
          shp.type,
          shp.title,
          shp.details,
          shp.image,
          shp.created_at,
          ARRAY_AGG(shc)
        ) FROM space_history shp
        LEFT JOIN space_history shc
        ON shp.id = shc.space_history_id
        WHERE ${where.join(' AND ')}
        GROUP BY shp.id
        HAVING COUNT(CASE WHEN shc.type IS NOT NULL AND shc.type = $3 THEN 1 END) = 0
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

    const [{ data, total }] = await this.spaceHistoryRepository.query(
      query,
      params,
    );

    let result = [];

    if (data != null) {
      result = data.map((item) => {
        const children = item.row.f15;
        return {
          id: item.row.f1,
          spaceId: item.row.f2,
          ruleId: item.row.f3,
          loggerId: item.row.f4,
          spaceHistoryId: item.row.f5,
          spacePermissionerId: item.row.f6,
          spaceEventId: item.row.f7,
          permissionRequestId: item.row.f8,
          isPublic: item.row.f9,
          type: item.row.f10,
          title: item.row.f11,
          details: item.row.f12,
          image: item.row.f13,
          createdAt: item.row.f14,
          children: children[0] === null ? [] : children,
        };
      });
    }

    return {
      data: result,
      total: Number(total),
    };
  }

  findOneById(id: string): Promise<SpaceHistory> {
    return this.spaceHistoryRepository.findOneBy({ id });
  }

  create(createSpaceHistoryDto: CreateSpaceHistoryDto): Promise<SpaceHistory> {
    const spaceHistory = this.spaceHistoryRepository.create({
      ...createSpaceHistoryDto,
      id: uuidv4(),
    });

    return this.spaceHistoryRepository.save(spaceHistory);
  }
}
