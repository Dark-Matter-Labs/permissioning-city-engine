import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { Rule } from '../../database/entity/rule.entity';
import { CreateRuleDto, FindAllRuleDto, UpdateRuleDto } from './dto';
import { RuleBlockType, RuleTarget } from 'src/lib/type';
import { RuleBlock } from 'src/database/entity/rule-block.entity';
import { User } from 'src/database/entity/user.entity';
import { PermissionRequest } from 'src/database/entity/permission-request.entity';
import { Space } from 'src/database/entity/space.entity';
import * as Util from 'src/lib/util/util';
import { v4 as uuidv4 } from 'uuid';

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
    const { page, limit, target, authorId, parentRuleId, hash } =
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
  ): Promise<{ archivedRule: Rule; updatedRule: Rule }> {
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

    // save archive
    const archivedRule = await this.ruleRepository.save(archive);
    const updatedRule = await this.ruleRepository.save({
      ...rule,
      name: name ?? rule.name,
      hash,
      ruleBlocks,
    });

    return {
      archivedRule,
      updatedRule,
    };
  }
}
