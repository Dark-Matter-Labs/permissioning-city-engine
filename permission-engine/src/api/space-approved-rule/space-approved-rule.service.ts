import { ForbiddenException, Injectable } from '@nestjs/common';
import {
  CreateSpaceApprovedRuleDto,
  FindAllSpaceApprovedRuleDto,
  UpdateSpaceApprovedRuleDto,
} from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { SpaceApprovedRule } from 'src/database/entity/space-approved-rule.entity';
import { Rule } from 'src/database/entity/rule.entity';
import { SpacePermissioner } from 'src/database/entity/space-permissioner.entity';
import { SpaceService } from '../space/space.service';
import { SpaceApprovedRuleSortBy } from 'src/lib/type';

@Injectable()
export class SpaceApprovedRuleService {
  constructor(
    @InjectRepository(SpaceApprovedRule)
    private spaceApprovedRuleRepository: Repository<SpaceApprovedRule>,
    @InjectRepository(SpacePermissioner)
    private spacePermissionerRepository: Repository<SpacePermissioner>,
    private readonly spaceService: SpaceService,
  ) {}

  async findAll(
    findAllSpaceApprovedRuleDto: FindAllSpaceApprovedRuleDto,
  ): Promise<{ data: Rule[]; total: number }> {
    const { page, limit, spaceId, ruleId, topicIds, isActive, sortBy } =
      findAllSpaceApprovedRuleDto;

    const where = [];
    const params: any[] = [(page - 1) * limit, limit];
    let paramIndex: number = params.length;
    let orderByClause = '';

    if (spaceId != null) {
      paramIndex++;
      where.push(`sar.space_id = $${paramIndex}`);
      params.push(spaceId);
    }

    if (ruleId != null) {
      paramIndex++;
      where.push(`sar.rule_id = $${paramIndex}`);
      params.push(ruleId);
    }

    if (isActive != null) {
      paramIndex++;
      where.push(`sar.is_active = $${paramIndex}`);
      params.push(isActive);
    }

    if (topicIds != null) {
      paramIndex++;
      where.push(`rt.topic_id = ANY($${paramIndex})`);
      params.push(topicIds);
    }

    if (sortBy != null) {
      switch (sortBy) {
        case SpaceApprovedRuleSortBy.popularity:
          orderByClause = `ORDER BY sar.utilization_count DESC`;
          break;
        case SpaceApprovedRuleSortBy.timeAsc:
          orderByClause = `ORDER BY sar.created_at ASC`;
          break;
        case SpaceApprovedRuleSortBy.timeDesc:
          orderByClause = `ORDER BY sar.created_at DESC`;
          break;
        default:
          break;
      }
    }

    const query = `
      WITH filtered_data AS (
        SELECT (
          r.id,
          r.name,
          r.hash,
          r.author_id,
          r.target,
          r.parent_rule_id,
          r.is_active,
          r.created_at,
          r.updated_at,
          sar.utilization_count,
          ARRAY_AGG(rb)
        ) FROM
         space_approved_rule sar,
         rule r,
         rule_topic rt,
         rule_rule_block rrb,
         rule_block rb
        WHERE
          sar.rule_id = r.id
        AND
          r.id = rt.rule_id
        AND
          r.id = rrb.rule_id
        AND
          rrb.rule_block_id = rb.id
        ${where.length > 0 ? ' AND ' : ''}
        ${where.join(' AND ')}
        GROUP BY r.id, sar.utilization_count, sar.created_at
        ${orderByClause}
      )
      SELECT COUNT(*) AS total, json_agg(filtered_data) AS data
      FROM filtered_data
      LIMIT $2 OFFSET $1;
    `;

    const [{ data, total }] = await this.spaceApprovedRuleRepository.query(
      query,
      params,
    );

    let result = [];

    if (data != null) {
      result = data.map((item) => {
        return {
          id: item.row.f1,
          name: item.row.f2,
          hash: item.row.f3,
          authorId: item.row.f4,
          target: item.row.f5,
          parentRuleId: item.row.f6,
          isActive: item.row.f7,
          createdAt: item.row.f8,
          updatedAt: item.row.f9,
          utilizationCount: item.row.f10,
          ruleBlocks: item.row.f11,
        };
      });
    }
    return {
      data: result,
      total: parseInt(total),
    };
  }

  findOne(spaceId: string, ruleId: string): Promise<SpaceApprovedRule> {
    return this.spaceApprovedRuleRepository.findOne({
      where: { spaceId, ruleId },
      relations: ['space', 'rule'],
    });
  }

  async create(
    createSpaceApprovedRuleDto: CreateSpaceApprovedRuleDto,
  ): Promise<SpaceApprovedRule> {
    const { spaceId } = createSpaceApprovedRuleDto;
    const space = await this.spaceService.findOneById(spaceId);
    const isPermissionerExists =
      await this.spacePermissionerRepository.existsBy({
        spaceId,
        isActive: true,
        userId: Not(space.ownerId),
      });

    if (isPermissionerExists === true) {
      throw new ForbiddenException('Cannot update rule whithout permission.');
    }

    const spaceApprovedRule = this.spaceApprovedRuleRepository.create({
      ...createSpaceApprovedRuleDto,
      isActive: true,
    });

    return this.spaceApprovedRuleRepository.save(spaceApprovedRule);
  }

  async update(
    updateSpaceApprovedRuleDto: UpdateSpaceApprovedRuleDto,
  ): Promise<{ data: { result: boolean } }> {
    const { spaceId, ruleId, isActive } = updateSpaceApprovedRuleDto;
    const space = await this.spaceService.findOneById(spaceId);
    const isPermissionerExists =
      await this.spacePermissionerRepository.existsBy({
        spaceId,
        isActive: true,
        userId: Not(space.ownerId),
      });

    if (isPermissionerExists === true) {
      throw new ForbiddenException('Cannot update rule whithout permission.');
    }

    const updateResult = await this.spaceApprovedRuleRepository.update(
      { spaceId, ruleId },
      {
        isActive,
        updatedAt: new Date(),
      },
    );

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }
}
