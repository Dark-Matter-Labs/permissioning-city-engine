import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { RuleBlock } from '../../../database/entity/rule-block.entity';
import { CreateRuleBlockDto } from '../dto';
import { RuleBlockType } from 'src/lib/type';
import * as Util from 'src/lib/util/util';

@Injectable()
export class RuleBlockService {
  constructor(
    @InjectRepository(RuleBlock)
    private ruleBlockRepository: Repository<RuleBlock>,
  ) {}

  async findAll(
    option: {
      page: number;
      limit: number;
      hash?: string | null;
      type?: RuleBlockType | null;
      authorId?: string | null;
      ids?: string[] | null;
    } = {
      page: 1,
      limit: 10,
    },
  ): Promise<{ data: RuleBlock[]; total: number }> {
    const { page, limit, hash, type, authorId, ids } = option;
    const where: FindOptionsWhere<RuleBlock> = {};

    if (type !== null) {
      where.type = type;
    }

    if (authorId !== null) {
      where.authorId = authorId;
    }

    if (hash !== null) {
      where.hash = hash;
    }

    if (ids !== null) {
      where.id = In(ids);
    }

    const [data, total] = await this.ruleBlockRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  findByAuthorId(authorId: string): Promise<RuleBlock[]> {
    return this.ruleBlockRepository.findBy({ authorId });
  }

  findOne(id: string): Promise<RuleBlock> {
    return this.ruleBlockRepository.findOneBy({ id });
  }

  async remove(id: string): Promise<void> {
    await this.ruleBlockRepository.delete(id);
  }

  create(createRuleBlockDto: CreateRuleBlockDto): Promise<RuleBlock> {
    const { type, content } = createRuleBlockDto;
    const hash = Util.hash(content);
    if (type === RuleBlockType.spaceConsentMethod) {
      const testRegex = /^(under|over|is)_[0-9]+_(yes|no)$/;

      if (testRegex.test(content) === false) {
        throw new BadRequestException();
      }
    }

    const ruleBlock = this.ruleBlockRepository.create({
      ...createRuleBlockDto,
      hash,
    });
    return this.ruleBlockRepository.save(ruleBlock);
  }
}
