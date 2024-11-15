import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsWhere, In, Repository } from 'typeorm';
import { Rule } from '../../database/entity/rule.entity';
import { CreateRuleDto, FindAllRuleDto, UpdateRuleDto } from './dto';
import {
  RuleBlockContentDivider,
  RuleBlockType,
  RuleTarget,
} from 'src/lib/type';
import { RuleBlock } from 'src/database/entity/rule-block.entity';
import { PermissionRequest } from 'src/database/entity/permission-request.entity';
import { Space } from 'src/database/entity/space.entity';
import * as Util from 'src/lib/util';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from 'src/lib/logger/logger.service';
import { FindAllMatchedRuleDto } from '../space/dto';

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
    option: {
      isPagination: boolean;
      isPublicOnly: boolean;
      queryUserId?: string;
    } = {
      isPagination: true,
      isPublicOnly: true,
    },
  ): Promise<{ data: Rule[]; total: number }> {
    const { page, limit, target, authorId, parentRuleId, hash, ids, isActive } =
      findAllRuleDto;
    const { isPagination, isPublicOnly, queryUserId } = option;
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

    if (isActive != null) {
      where.isActive = isActive;
    } else {
      where.isActive = true;
    }

    let queryOption: FindManyOptions<Rule> = {
      where,
      relations: ['ruleBlocks'],
    };
    if (isPagination === true) {
      queryOption = {
        ...queryOption,
        skip: (page - 1) * limit,
        take: limit,
      };
    }

    const [data, total] = await this.ruleRepository.findAndCount(queryOption);
    let result = data ?? [];

    if (isPublicOnly === true) {
      result = result.map((rule) => {
        if (rule.ruleBlocks) {
          const publicRuleBlocks = rule?.ruleBlocks?.filter(
            (ruleBlock) => ruleBlock.isPublic === true,
          );
          if (!queryUserId || queryUserId !== rule.authorId) {
            rule.ruleBlocks = publicRuleBlocks;
          }
        }

        return rule;
      });
    }

    return {
      data: result,
      total,
    };
  }

  async findAllMatched(
    findAllMatchedRuleDto: FindAllMatchedRuleDto,
  ): Promise<{ data: Rule[]; total: number }> {
    const { page, limit, spaceId, spaceEventExceptions } =
      findAllMatchedRuleDto;

    const where = [];
    const params: any[] = [(page - 1) * limit, limit, spaceId];
    let paramIndex: number = params.length;

    if (spaceEventExceptions != null) {
      spaceEventExceptions.forEach((spaceEventException) => {
        paramIndex++;
        where.push(
          `(rb.type = 'space_event:exception' AND rb.content LIKE $${paramIndex})`,
        );
        params.push(
          `${spaceEventException.split(RuleBlockContentDivider.type)[0]}%`,
        );
      });
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

  async findOneById(
    id: string,
    option: { isPublicOnly: boolean } = { isPublicOnly: false },
  ): Promise<Rule> {
    const rule = await this.ruleRepository.findOne({
      where: {
        id,
      },
      relations: ['ruleBlocks', 'topics'],
    });
    const { isPublicOnly } = option;
    if (isPublicOnly === true) {
      const publicRuleBlocks = rule.ruleBlocks.filter(
        (ruleBlock) => ruleBlock.isPublic === true,
      );
      rule.ruleBlocks = publicRuleBlocks;
    }

    return rule;
  }

  async findOneByName(
    name: string,
    option: { isPublicOnly: boolean } = { isPublicOnly: false },
  ): Promise<Rule> {
    const { isPublicOnly } = option;
    const rule = await this.ruleRepository.findOne({
      where: { name },
      relations: ['ruleBlocks', 'topics'],
    });

    if (isPublicOnly === true) {
      const publicRuleBlocks = rule.ruleBlocks.filter(
        (ruleBlock) => ruleBlock.isPublic === true,
      );
      rule.ruleBlocks = publicRuleBlocks;
    }

    return rule;
  }

  async remove(id: string): Promise<void> {
    await this.ruleRepository.delete(id);
  }

  async create(
    authorId: string,
    createRuleDto: CreateRuleDto,
    ruleBlocks: RuleBlock[],
    hash: string,
  ): Promise<Rule> {
    const { topicIds } = createRuleDto;
    const rule = this.ruleRepository.create({
      ...createRuleDto,
      id: uuidv4(),
      authorId,
      ruleBlocks,
      hash,
    });

    await this.ruleRepository.save(rule);

    if (topicIds) {
      for (const topicId of topicIds) {
        try {
          await this.addTopic(rule.id, topicId);
        } catch (error) {
          this.logger.error(error.message, error);
        }
      }
    }

    return rule;
  }

  async createSpaceRule(
    authorId: string,
    createRuleDto: CreateRuleDto,
  ): Promise<Rule> {
    const { target, ruleBlockIds } = createRuleDto;

    if (target !== RuleTarget.space) {
      throw new BadRequestException();
    }

    if (!ruleBlockIds) {
      throw new BadRequestException(
        `Need to contain at least 1 item in ruleBlockIds`,
      );
    }

    const ruleBlocks = await this.ruleBlockRepository.find({
      where: { id: In(ruleBlockIds) },
    });
    const hash = this.generateRuleHash(ruleBlocks.map((item) => item.hash));

    this.validateSpaceRuleBlockSet(ruleBlocks);

    return await this.create(authorId, createRuleDto, ruleBlocks, hash);
  }

  async createSpaceEventRule(
    authorId: string,
    createRuleDto: CreateRuleDto,
  ): Promise<Rule> {
    const { target, ruleBlockIds } = createRuleDto;
    const emptyHash: string = Util.hash('');
    let ruleBlocks: RuleBlock[] = [];
    let hash: string = emptyHash;

    if (target !== RuleTarget.spaceEvent) {
      throw new BadRequestException();
    }

    if (ruleBlockIds) {
      ruleBlocks = await this.ruleBlockRepository.find({
        where: { id: In(ruleBlockIds) },
      });
      hash = this.generateRuleHash(ruleBlocks.map((item) => item.hash));
    }

    const duplicateSpaceEventRule = (
      await this.findAll(
        { target: RuleTarget.spaceEvent, hash, isActive: true },
        {
          isPagination: false,
          isPublicOnly: false,
        },
      )
    )?.data?.[0];

    if (duplicateSpaceEventRule) {
      return duplicateSpaceEventRule;
    }

    if (ruleBlocks.length > 0) {
      this.validateSpaceEventRuleBlockSet(ruleBlocks);
    }

    return await this.create(authorId, createRuleDto, ruleBlocks, hash);
  }

  async fork(
    authorId: string,
    forkRuleDto: { id: string; name?: string },
    option: { isPublicOnly: boolean },
  ): Promise<Rule> {
    const { name, id } = forkRuleDto;
    const { isPublicOnly } = option;
    const rule = await this.ruleRepository.findOne({
      where: { id },
      relations: ['ruleBlocks'],
    });

    if (!rule) {
      throw new BadRequestException();
    }

    if (isPublicOnly) {
      const publicRuleBlocks = rule.ruleBlocks.filter(
        (ruleBlock) => ruleBlock.isPublic === true,
      );
      rule.ruleBlocks = publicRuleBlocks;
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
   * Cannot update assigned space rule
   * Cannot update spaceEvent rule when permission request exists
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
      throw new BadRequestException(`There is no rule with id: ${id}`);
    }

    const { target } = rule;

    const ruleBlocks = await this.ruleBlockRepository.find({
      where: { id: In(ruleBlockIds) },
    });

    if (ruleBlocks.length !== ruleBlockIds.length) {
      throw new BadRequestException(`ruleBlockIds contain wrong items`);
    }

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
          'This rule is being used. Try forking it.',
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
        this.logger.error('Failed to save rule', error);
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

  /**
   * Only allowed to PermissionHandler
   */
  async update(
    id: string,
    updateRuleDto: UpdateRuleDto,
  ): Promise<{
    data: {
      result: boolean;
    };
  }> {
    const { name, ruleBlockIds } = updateRuleDto;
    const rule = await this.ruleRepository.findOne({
      where: { id },
      relations: ['ruleBlocks'],
    });

    if (!rule) {
      throw new BadRequestException(`There is no rule with id: ${id}`);
    }

    const { target } = rule;

    const ruleBlocks = await this.ruleBlockRepository.find({
      where: { id: In(ruleBlockIds) },
    });

    if (ruleBlocks.length !== ruleBlockIds.length) {
      throw new BadRequestException(`ruleBlockIds contain wrong items`);
    }

    const hash = Util.hash(
      ruleBlocks
        .map((item) => item.hash)
        .sort()
        .join(),
    );

    if (target === RuleTarget.space) {
      this.validateSpaceRuleBlockSet(ruleBlocks);
    } else if (target === RuleTarget.spaceEvent) {
      this.validateSpaceEventRuleBlockSet(ruleBlocks);
    } else {
      throw new BadRequestException();
    }

    let result = true;

    // save archive
    await this.ruleRepository
      .save({
        ...rule,
        name: name ?? rule.name,
        hash,
        ruleBlocks,
      })
      .catch((error) => {
        this.logger.error('Failed to save rule', error);
        result = false;
        return null;
      });

    return {
      data: {
        result,
      },
    };
  }

  async addTopic(
    id: string,
    topicId: string,
  ): Promise<{ data: { result: boolean } }> {
    let result = false;
    try {
      const rule = await this.findOneById(id);

      if (rule.topics.length >= 20) {
        throw new BadRequestException(`Cannot have more than 20 topics`);
      }

      await this.ruleRepository
        .createQueryBuilder()
        .relation(Rule, 'topics')
        .of(id)
        .add(topicId)
        .then(() => {
          result = true;
        });
    } catch (error) {
      throw error;
    }

    return {
      data: {
        result,
      },
    };
  }

  async removeTopic(
    id: string,
    topicId: string,
  ): Promise<{ data: { result: boolean } }> {
    let result = false;

    try {
      await this.ruleRepository
        .createQueryBuilder()
        .relation(Rule, 'topics')
        .of(id)
        .remove(topicId)
        .then(() => {
          result = true;
        });
    } catch (error) {
      result = false;
    }

    return {
      data: {
        result,
      },
    };
  }

  validateSpaceRuleBlockSet(ruleBlocks: RuleBlock[]): boolean {
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

    const spaceAllowedEventAccessType = ruleBlocks.filter(
      (item) => item.type === RuleBlockType.spaceAllowedEventAccessType,
    );

    if (spaceAllowedEventAccessType.length !== 1) {
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

    return true;
  }

  validateSpaceEventRuleBlockSet(ruleBlocks: RuleBlock[]): boolean {
    if (ruleBlocks.find((item) => item.type.startsWith('space:'))) {
      throw new BadRequestException('Target mismatch');
    }

    return true;
  }

  generateRuleHash(ruleBlockHashs: string[]) {
    return Util.hash(ruleBlockHashs.sort().join());
  }
}
