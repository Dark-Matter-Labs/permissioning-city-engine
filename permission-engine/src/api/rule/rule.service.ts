import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository, UpdateResult } from 'typeorm';
import { Rule } from '../../database/entity/rule.entity';
import {
  CreateRuleDto,
  FindAllRuleDto,
  ForkRuleDto,
  UpdateRuleDto,
} from './dto';
import { RuleBlockType, RuleTarget } from 'src/lib/type';
import { RuleBlock } from 'src/database/entity/rule-block.entity';
import { User } from 'src/database/entity/user.entity';
import { PermissionRequest } from 'src/database/entity/permission-request.entity';
import { Space } from 'src/database/entity/space.entity';
import * as Util from 'src/lib/util/util';

@Injectable()
export class RuleService {
  constructor(
    @InjectRepository(Rule)
    private ruleRepository: Repository<Rule>,
    @InjectRepository(RuleBlock)
    private ruleBlockRepository: Repository<RuleBlock>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Space)
    private spaceRepository: Repository<Space>,
    @InjectRepository(PermissionRequest)
    private permissionRequestRepository: Repository<PermissionRequest>,
  ) {}

  async findAll(
    findAllRuleDto: FindAllRuleDto,
  ): Promise<{ data: Rule[]; total: number }> {
    const { target, authorId, parentRuleId, hash } = findAllRuleDto;
    let { page, limit } = findAllRuleDto;

    if (!page) {
      page = 1;
    }

    if (!limit) {
      limit = 10;
    }

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

    const [data, total] = await this.ruleRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: data ?? [],
      total,
    };
  }

  findOneById(id: string): Promise<Rule> {
    return this.ruleRepository.findOneBy({ id });
  }

  findOneByName(name: string): Promise<Rule> {
    return this.ruleRepository.findOneBy({ name });
  }

  async remove(id: string): Promise<void> {
    await this.ruleRepository.delete(id);
  }

  async create(createRuleDto: CreateRuleDto): Promise<Rule> {
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
      if (ruleBlocks.find((item) => item.type.startsWith('space_event'))) {
        throw new BadRequestException();
      }

      const spaceConsentMethodBlocks = ruleBlocks.filter(
        (item) => item.type === RuleBlockType.spaceConsentMethod,
      );

      if (spaceConsentMethodBlocks.length > 1) {
        throw new BadRequestException();
      }
    } else if (target === RuleTarget.spaceEvent) {
      if (ruleBlocks.find((item) => item.type.startsWith('space'))) {
        throw new BadRequestException();
      }
    } else {
      throw new BadRequestException();
    }

    const rule = this.ruleRepository.create({
      ...createRuleDto,
      ruleBlocks,
      hash,
    });

    return this.ruleRepository.save(rule);
  }

  async fork(authorId: string, forkRuleDto: ForkRuleDto): Promise<Rule> {
    const { name, id } = forkRuleDto;
    const rule = await this.ruleRepository.findOneBy({ id });

    if (!rule) {
      throw new BadRequestException();
    }

    const newRule = this.ruleRepository.create({
      parentRuleId: id,
      authorId,
      name: name ?? rule.name,
      ...rule,
    });

    return this.ruleRepository.save(newRule);
  }

  /**
   * The author of the rule can update the Rule.
   * Cannot update space rule
   * Cannot update spaceEvent rule when permission is requested
   */
  async update(
    id: string,
    updateRuleDto: UpdateRuleDto,
  ): Promise<UpdateResult> {
    const { name, ruleBlockIds } = updateRuleDto;
    const rule = await this.ruleRepository.findOneBy({ id });

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

      if (spaceConsentMethodBlocks.length > 1) {
        throw new BadRequestException(
          'There can be only one RuleBlock with space:consent_method type.',
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

    return this.ruleRepository.update(rule.id, {
      name: name ?? rule.name,
      hash,
      ruleBlocks,
    });
  }
}
