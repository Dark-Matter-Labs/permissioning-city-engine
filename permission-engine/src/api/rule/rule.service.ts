import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { Rule } from '../../database/entity/rule.entity';
import { CreateRuleDto, ForkRuleDto } from './dto';
import { RuleBlockType, RuleTarget } from 'src/lib/type';
import { RuleBlock } from 'src/database/entity/rule-block.entity';
import * as Util from 'src/lib/util/util';

@Injectable()
export class RuleService {
  constructor(
    @InjectRepository(Rule)
    private ruleRepository: Repository<Rule>,
    private ruleBlockRepository: Repository<RuleBlock>,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    target: RuleTarget | null = null,
    authorId: string | null = null,
    parentRuleId: string | null = null,
    hash: string | null = null,
  ): Promise<{ data: Rule[]; total: number }> {
    const where: FindOptionsWhere<Rule> = { isActive: true };

    if (target !== null) {
      where.target = target;
    }

    if (authorId !== null) {
      where.authorId = authorId;
    }

    if (parentRuleId !== null) {
      where.parentRuleId = parentRuleId;
    }

    if (hash !== null) {
      where.hash = hash;
    }

    const [data, total] = await this.ruleRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
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

  async fork(forkRuleDto: ForkRuleDto): Promise<Rule> {
    const { id, authorId } = forkRuleDto;
    const rule = await this.ruleRepository.findOneBy({ id });

    if (!rule) {
      throw new BadRequestException();
    }

    const newRule = this.ruleRepository.create({
      parentRuleId: id,
      authorId: authorId,
      name: rule.name,
      target: rule.target,
    });

    return this.ruleRepository.save(newRule);
  }
}
