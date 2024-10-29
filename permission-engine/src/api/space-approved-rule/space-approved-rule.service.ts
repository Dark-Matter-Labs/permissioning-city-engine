import { Injectable } from '@nestjs/common';
import {
  CreateSpaceApprovedRuleDto,
  FindAllSpaceApprovedRuleDto,
  UpdateSpaceApprovedRuleDto,
} from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpaceApprovedRule } from 'src/database/entity/space-approved-rule.entity';
import { Rule } from 'src/database/entity/rule.entity';

@Injectable()
export class SpaceApprovedRuleService {
  constructor(
    @InjectRepository(SpaceApprovedRule)
    private spaceApprovedRuleRepository: Repository<SpaceApprovedRule>,
  ) {}

  async findAll(
    findAllRuleDto: FindAllSpaceApprovedRuleDto,
  ): Promise<{ data: Rule[]; total: number }> {
    const { page, limit, spaceId, ruleId, isActive } = findAllRuleDto;

    const where = [];
    const params: any[] = [(page - 1) * limit, limit];
    let paramIndex: number = params.length;

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
          ARRAY_AGG(rb)
        ) FROM
         space_approved_rule sar,
         rule r,
         rule_rule_block rrb,
         rule_block rb
        WHERE
          sar.rule_id = r.id
        AND
          r.id = rrb.rule_id
        AND
          rrb.rule_block_id = rb.id
        ${where.join(' AND ')}
        GROUP BY r.id
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
          ruleBlocks: item.row.f10,
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

  create(
    createSpaceApprovedRuleDto: CreateSpaceApprovedRuleDto,
  ): Promise<SpaceApprovedRule> {
    const spaceApprovedRule = this.spaceApprovedRuleRepository.create({
      ...createSpaceApprovedRuleDto,
      isActive: true,
    });

    return this.spaceApprovedRuleRepository.save(spaceApprovedRule);
  }

  async update(
    id: string,
    updateSpaceApprovedRuleDto: UpdateSpaceApprovedRuleDto,
  ): Promise<{ data: { result: boolean } }> {
    const updateResult = await this.spaceApprovedRuleRepository.update(id, {
      ...updateSpaceApprovedRuleDto,
      updatedAt: new Date(),
    });

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }
}
