import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { RuleBlock } from '../../database/entity/rule-block.entity';
import { CreateRuleBlockDto, FindAllRuleBlockDto } from './dto';
import { RuleBlockType } from 'src/lib/type';
import * as Util from 'src/lib/util/util';

@Injectable()
export class RuleBlockService {
  constructor(
    @InjectRepository(RuleBlock)
    private ruleBlockRepository: Repository<RuleBlock>,
  ) {}

  async findAll(
    findAllRuleBlockDto: FindAllRuleBlockDto,
  ): Promise<{ data: RuleBlock[]; total: number }> {
    const { page, limit, hash, type, authorId, ids } = findAllRuleBlockDto;

    const where: FindOptionsWhere<RuleBlock> = {};

    if (type != null) {
      where.type = type;
    }

    if (authorId != null) {
      where.authorId = authorId;
    }

    if (hash != null) {
      where.hash = hash;
    }

    if (ids != null) {
      where.id = In(ids);
    }

    const [data, total] = await this.ruleBlockRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: data ?? [],
      total,
    };
  }

  findOne(id: string): Promise<RuleBlock> {
    return this.ruleBlockRepository.findOneBy({ id });
  }

  async remove(id: string): Promise<void> {
    await this.ruleBlockRepository.delete(id);
  }

  create(
    authorId: string,
    createRuleBlockDto: CreateRuleBlockDto,
  ): Promise<RuleBlock> {
    const { type, content, name } = createRuleBlockDto;
    const trimmedContent = content.trim();
    const trimmedName = name.trim();
    const hash = Util.hash(trimmedContent);

    const ruleBlock = this.ruleBlockRepository.findOneBy({ hash });

    if (ruleBlock) {
      return ruleBlock;
    }

    if (type === RuleBlockType.spaceConsentMethod) {
      const testRegex = /^(under|over|is)_[0-9]+_(yes|no)$/;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [operator, percent, _flag] = trimmedContent;
      if (
        testRegex.test(content) === false ||
        (operator === 'under' && parseInt(percent) === 0) ||
        (operator === 'over' && parseInt(percent) === 100) ||
        parseInt(percent) > 100 ||
        parseInt(percent) < 0
      ) {
        throw new BadRequestException(
          'Consent conditions must in format: {under|over|is}_{percent}_{yes|no}',
        );
      }
    }

    const newRuleBlock = this.ruleBlockRepository.create({
      ...createRuleBlockDto,
      authorId,
      content: trimmedContent,
      name: trimmedName,
      hash,
    });

    return this.ruleBlockRepository.save(newRuleBlock);
  }
}
