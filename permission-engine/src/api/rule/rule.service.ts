import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsWhere, In, Repository } from 'typeorm';
import { Rule } from '../../database/entity/rule.entity';
import {
  CreateRuleDto,
  FindAllMatchedRuleDto,
  FindAllRuleDto,
  UpdateRuleDto,
} from './dto';
import {
  RuleBlockContentDivider,
  RuleBlockType,
  RuleTarget,
} from 'src/lib/type';
import { RuleBlock } from 'src/database/entity/rule-block.entity';
import { PermissionRequest } from 'src/database/entity/permission-request.entity';
import { Space } from 'src/database/entity/space.entity';
import * as Util from 'src/lib/util/util';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from 'src/lib/logger/logger.service';

@Injectable()
export class RuleService {
  constructor(
    @InjectRepository(Rule)
    private ruleRepository: Repository<Rule>,
    @InjectRepository(RuleBlock)
    private ruleBlockRepository: Repository<RuleBlock>,
    @InjectRepository(Space)
    private spaceRepository: Repository<Space>,
    @InjectRepository(PermissionRequest)
    private permissionRequestRepository: Repository<PermissionRequest>,
    private readonly logger: Logger,
  ) {}

  async findAll(
    findAllRuleDto: FindAllRuleDto,
    isPagination: boolean = true,
  ): Promise<{ data: Rule[]; total: number }> {
    const { page, limit, target, authorId, parentRuleId, hash, ids } =
      findAllRuleDto;

    const where: FindOptionsWhere<Rule> = { isActive: true };

    if (target != null) {
      where.target = target;
    }

    if (authorId != null) {
      where.authorId = authorId;
    }

    if (parentRuleId != null) {
      where.parentRuleId = parentRuleId;
    }

    if (hash != null) {
      where.hash = hash;
    }

    if (ids != null) {
      where.id = In(ids);
    }

    let queryOption: FindManyOptions<Rule> = { where };
    if (isPagination === true) {
      queryOption = {
        ...queryOption,
        relations: ['ruleBlocks'],
        skip: (page - 1) * limit,
        take: limit,
      };
    }

    const [data, total] = await this.ruleRepository.findAndCount(queryOption);

    return {
      data: data ?? [],
      total,
    };
  }

  async findAllMatched(
    spaceId: string,
    findAllMatchedRuleDto: FindAllMatchedRuleDto,
  ): Promise<{ data: Rule[]; total: number }> {
    const {
      page,
      limit,
      spaceEventAccess,
      spaceEventExpectedAttendeeCount,
      spaceEventRequireEquipments,
      spaceEventExceptions,
      spacePrePremissionCheckAnswers,
    } = findAllMatchedRuleDto;

    const where = [];
    const params: any[] = [(page - 1) * limit, limit, spaceId];
    let paramIndex: number = params.length;

    if (spaceEventAccess != null) {
      paramIndex++;
      where.push(
        `(rb.type = 'space_event:access' AND rb.content = $${paramIndex})`,
      );
      params.push(spaceEventAccess);
    }

    if (spaceEventExpectedAttendeeCount != null) {
      paramIndex++;
      where.push(
        `(rb.type = 'space_event:expected_attendee_count' AND CAST(rb.content AS INTEGER) >= $${paramIndex})`,
      );
      params.push(spaceEventExpectedAttendeeCount);
    }

    if (spaceEventRequireEquipments != null) {
      spaceEventRequireEquipments.forEach((spaceEventRequireEquipment) => {
        const [spaceEquipmentId, quantity] =
          spaceEventRequireEquipment.split(':');
        where.push(
          `(rb.type = 'space_event:require_equipments' AND rb.content LIKE $${paramIndex + 1} AND CAST(split_part(rb.content, ':', 2) AS INTEGER) >= $${paramIndex + 2})`,
        );
        paramIndex = paramIndex + 2;
        params.push(`${spaceEquipmentId}%`, quantity);
      });
    }

    if (spaceEventExceptions != null) {
      spaceEventExceptions.forEach((spaceEventException) => {
        paramIndex++;
        where.push(
          `(rb.type = 'space_event:exception' AND rb.content LIKE $${paramIndex})`,
        );
        params.push(`${spaceEventException.split(':')[0]}%`);
      });
    }

    if (spacePrePremissionCheckAnswers != null) {
      spacePrePremissionCheckAnswers.forEach(
        (spacePrePremissionCheckAnswer) => {
          paramIndex++;
          where.push(
            `(rb.type = 'space_event:pre_permission_check_answer' AND rb.content = $${paramIndex})`,
          );
          params.push(spacePrePremissionCheckAnswer);
        },
      );
    }

    function buildWhereClause(conditions = []) {
      if (!conditions || conditions.length === 0) {
        return '';
      }

      return `AND (
        ${where.join(' OR ')}
      )`;
    }

    paramIndex++;
    params.push(where.length);

    const query = `
      WITH filtered_data AS (
        SELECT
          r.id,
          r.name,
          r.hash,
          r.author_id,
          r.target,
          r.parent_rule_id,
          r.is_active,
          r.created_at,
          r.updated_at
        FROM rule r
        JOIN rule_rule_block rrb ON r.id = rrb.rule_id
        JOIN rule_block rb ON rrb.rule_block_id = rb.id
        WHERE 
        (
          rrb.rule_id IN (
            SELECT
              space_event_rule_id
            FROM
              permission_request
            WHERE
              space_id = $3
            AND
              status IN ('review_approved', 'review_approved_with_condition')
          ) 
        )
        ${buildWhereClause(where)}
        GROUP BY r.id
        HAVING COUNT(DISTINCT rb.id) >= $${paramIndex}
      )
      SELECT COUNT(*) AS total, json_agg(filtered_data) AS data
      FROM filtered_data
      LIMIT $2 OFFSET $1;
    `;

    const [{ data, total }] = await this.ruleRepository.query(query, params);

    let result = [];
    if (data != null) {
      result = data.map((item) => {
        return {
          id: item.id,
          name: item.name,
          hash: item.hash,
          authorId: item.author_id,
          target: item.target,
          parentRuleId: item.parent_rule_id,
          isActive: item.is_active,
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

  findOneById(id: string): Promise<Rule> {
    return this.ruleRepository.findOne({
      where: {
        id,
      },
      relations: ['ruleBlocks', 'topics'],
    });
  }

  findOneByName(name: string): Promise<Rule> {
    return this.ruleRepository.findOne({
      where: { name },
      relations: ['ruleBlocks', 'topics'],
    });
  }

  async remove(id: string): Promise<void> {
    await this.ruleRepository.delete(id);
  }

  async create(authorId: string, createRuleDto: CreateRuleDto): Promise<Rule> {
    const { target, ruleBlockIds } = createRuleDto;
    const ruleBlocks = await this.ruleBlockRepository.find({
      where: { id: In(ruleBlockIds) },
    });
    const hash = Util.hash(
      ruleBlocks
        .map((item) => item.hash)
        .sort()
        .join(),
    );

    if (target === RuleTarget.space) {
      if (ruleBlocks.find((item) => item.type.startsWith('space_event:'))) {
        throw new BadRequestException('Target mismatch');
      }

      const spaceConsentMethodBlocks = ruleBlocks.filter(
        (item) => item.type === RuleBlockType.spaceConsentMethod,
      );

      if (spaceConsentMethodBlocks.length !== 1) {
        throw new BadRequestException(
          'There should be one RuleBlock with space:consent_method type.',
        );
      }

      const spaceAccess = ruleBlocks.filter(
        (item) => item.type === RuleBlockType.spaceAccess,
      );

      if (spaceAccess.length !== 1) {
        throw new BadRequestException(
          'There should be one RuleBlock with space:access type.',
        );
      }

      const spaceMaxAttendee = ruleBlocks.filter(
        (item) => item.type === RuleBlockType.spaceMaxAttendee,
      );

      if (spaceMaxAttendee.length !== 1) {
        throw new BadRequestException(
          'There should be one RuleBlock with space:max_attendee type.',
        );
      }

      const spaceAvailabilityBlocks = ruleBlocks.filter(
        (item) => item.type === RuleBlockType.spaceAvailability,
      );

      if (spaceAvailabilityBlocks.length !== 1) {
        throw new BadRequestException(
          'There should be one RuleBlock with space:availability type.',
        );
      }

      const spaceAvailabilityUnitBlocks = ruleBlocks.filter(
        (item) => item.type === RuleBlockType.spaceAvailabilityUnit,
      );

      if (spaceAvailabilityUnitBlocks.length !== 1) {
        throw new BadRequestException(
          'There should be one RuleBlock with space:availability_unit type.',
        );
      }

      const spaceAvailabilityBufferBlocks = ruleBlocks.filter(
        (item) => item.type === RuleBlockType.spaceAvailabilityBuffer,
      );

      if (spaceAvailabilityBufferBlocks.length !== 1) {
        throw new BadRequestException(
          'There should be one RuleBlock with space:availability_buffer type.',
        );
      }
    } else if (target === RuleTarget.spaceEvent) {
      if (ruleBlocks.find((item) => item.type.startsWith('space:'))) {
        throw new BadRequestException('Target mismatch');
      }
    } else {
      throw new BadRequestException();
    }

    const rule = this.ruleRepository.create({
      ...createRuleDto,
      id: uuidv4(),
      authorId,
      ruleBlocks,
      hash,
    });

    return this.ruleRepository.save(rule);
  }

  async fork(
    authorId: string,
    forkRuleDto: { id: string; name?: string },
  ): Promise<Rule> {
    const { name, id } = forkRuleDto;
    const rule = await this.ruleRepository.findOneBy({ id });

    if (!rule) {
      throw new BadRequestException();
    }

    const newRule = this.ruleRepository.create({
      ...rule,
      id: uuidv4(),
      parentRuleId: id,
      authorId,
      name: name ?? rule.name,
    });

    return this.ruleRepository.save(newRule);
  }

  /**
   * The author of the rule can update the Rule.
   * Cannot update space rule
   * Cannot update spaceEvent rule when permission is requested
   */
  async archiveAndUpdate(
    id: string,
    updateRuleDto: UpdateRuleDto,
  ): Promise<{
    data: {
      result: boolean;
      archivedRule: Rule | null;
      updatedRule: Rule | null;
    };
  }> {
    const { name, ruleBlockIds } = updateRuleDto;
    const rule = await this.ruleRepository.findOne({
      where: { id },
      relations: ['ruleBlocks'],
    });

    if (!rule) {
      throw new BadRequestException();
    }

    const { target } = rule;

    const ruleBlocks = await this.ruleBlockRepository.find({
      where: { id: In(ruleBlockIds) },
    });

    const hash = Util.hash(
      ruleBlocks
        .map((item) => item.hash)
        .sort()
        .join(),
    );

    if (target === RuleTarget.space) {
      // check ruleBlock validity
      if (ruleBlocks.find((item) => item.type.startsWith('space_event:'))) {
        throw new BadRequestException();
      }

      const spaceConsentMethodBlocks = ruleBlocks.filter(
        (item) => item.type === RuleBlockType.spaceConsentMethod,
      );

      if (spaceConsentMethodBlocks.length !== 1) {
        throw new BadRequestException(
          'There should be one RuleBlock with space:consent_method type.',
        );
      }

      // check if space assigned: it needs permission from the space permissioners
      const space = await this.spaceRepository.findOneBy({ ruleId: id });

      if (space) {
        throw new BadRequestException(
          'This rule is being used. Try forking it.',
        );
      }
    } else if (target === RuleTarget.spaceEvent) {
      // check ruleBlock validity
      if (ruleBlocks.find((item) => item.type.startsWith('space:'))) {
        throw new BadRequestException();
      }

      // check if the space event is under permission request review
      const permissionRequest =
        await this.permissionRequestRepository.findOneBy({
          spaceEventRuleId: id,
        });

      if (permissionRequest) {
        throw new BadRequestException(
          'This rule is being used. Try forking it or wait until permission request is resolved.',
        );
      }
    } else {
      throw new BadRequestException();
    }

    // fork rule for archive
    const archive = this.ruleRepository.create({
      ...rule,
      id: uuidv4(),
      parentRuleId: rule.id,
      authorId: rule.authorId,
      name: `${rule.name}-${Date.now()}`,
      ruleBlocks: rule.ruleBlocks,
    });

    let result = true;

    // save archive
    const archivedRule = await this.ruleRepository
      .save(archive)
      .catch((error) => {
        this.logger.error('Failed to save archivedRule', error);
        result = false;
        return null;
      });
    const updatedRule = await this.ruleRepository
      .save({
        ...rule,
        name: name ?? rule.name,
        hash,
        ruleBlocks,
      })
      .catch((error) => {
        this.logger.error('Failed to save atch', error);
        result = false;
        return null;
      });

    return {
      data: {
        result,
        archivedRule,
        updatedRule,
      },
    };
  }
}
