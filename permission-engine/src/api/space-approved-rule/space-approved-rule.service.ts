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
import { RuleService } from '../rule/rule.service';

@Injectable()
export class SpaceApprovedRuleService {
  constructor(
    @InjectRepository(SpaceApprovedRule)
    private spaceApprovedRuleRepository: Repository<SpaceApprovedRule>,
    @InjectRepository(SpacePermissioner)
    private spacePermissionerRepository: Repository<SpacePermissioner>,
    private readonly spaceService: SpaceService,
    private readonly ruleService: RuleService,
  ) {}

  async findAll(
    findAllSpaceApprovedRuleDto: FindAllSpaceApprovedRuleDto,
    option: { isPublic: boolean } = { isPublic: true },
  ): Promise<{ data: Rule[]; total: number }> {
    const { isPublic } = option;
    const {
      page,
      limit,
      spaceId,
      ruleId,
      publicHash,
      topicIds,
      isActive,
      sortBy,
    } = findAllSpaceApprovedRuleDto;

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

    if (publicHash != null) {
      paramIndex++;
      where.push(`sar.public_hash = $${paramIndex}`);
      params.push(publicHash);
    }

    if (isActive != null) {
      paramIndex++;
      where.push(`sar.is_active = $${paramIndex}`);
      params.push(isActive);
    }

    if (isPublic != null) {
      paramIndex++;
      where.push(`sar.is_public = $${paramIndex}`);
      params.push(isPublic);
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
          r.public_hash,
          r.author_id,
          r.target,
          r.parent_rule_id,
          r.is_active,
          r.created_at,
          r.updated_at,
          sar.utilization_count,
          ARRAY_AGG(DISTINCT rb),
          ARRAY_AGG(DISTINCT t)
        ) FROM
         space_approved_rule sar,
         rule r,
         rule_topic rt,
         topic t,
         rule_rule_block rrb,
         rule_block rb
        WHERE
          sar.rule_id = r.id
        AND
          r.id = rt.rule_id
        AND
          t.id = rt.topic_id
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
        let ruleBlocks = item.row.f12;
        let topics = item.row.f13;
        if (ruleBlocks) {
          ruleBlocks = ruleBlocks.map((item) => {
            return {
              id: item.id,
              name: item.name,
              hash: item.hash,
              author: item.author,
              authorId: item.author_id,
              type: item.type,
              content: item.content,
              details: item.details,
              isPublic: item.is_public,
              createdAt: item.created_at,
              updatedAt: item.updated_at,
            };
          });
        }
        if (topics) {
          topics = topics.map((item) => {
            return {
              id: item.id,
              authorId: item.author_id,
              name: item.name,
              icon: item.icon,
              country: item.country,
              region: item.region,
              city: item.city,
              details: item.details,
              isActive: item.is_active,
              createdAt: item.created_at,
              updatedAt: item.updated_at,
            };
          });
        }

        return {
          id: item.row.f1,
          name: item.row.f2,
          hash: item.row.f3,
          publicHash: item.row.f4,
          authorId: item.row.f5,
          target: item.row.f6,
          parentRuleId: item.row.f7,
          isActive: item.row.f8,
          createdAt: item.row.f9,
          updatedAt: item.row.f10,
          utilizationCount: item.row.f11,
          ruleBlocks,
          topics,
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
    option: { isForce: boolean } = { isForce: false },
  ): Promise<SpaceApprovedRule> {
    const { isForce } = option;
    const { spaceId, ruleId } = createSpaceApprovedRuleDto;
    const space = await this.spaceService.findOneById(spaceId);
    const rule = await this.ruleService.findOneById(ruleId);
    const isPublic = !rule.ruleBlocks.find((item) => item.isPublic === false);
    const existingSpaceApprovedRule = await this.findOne(spaceId, ruleId);

    if (existingSpaceApprovedRule) {
      return existingSpaceApprovedRule;
    } else {
      const isPermissionerExists =
        await this.spacePermissionerRepository.existsBy({
          spaceId,
          isActive: true,
          userId: Not(space.ownerId),
        });

      if (isForce === false && isPermissionerExists === true) {
        throw new ForbiddenException('Cannot update rule whithout permission.');
      }

      const spaceApprovedRule = this.spaceApprovedRuleRepository.create({
        ...createSpaceApprovedRuleDto,
        publicHash: rule.publicHash,
        isActive: true,
        isPublic,
      });

      return this.spaceApprovedRuleRepository.save(spaceApprovedRule);
    }
  }

  async updateIsActive(
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
