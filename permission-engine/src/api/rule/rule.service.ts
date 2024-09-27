import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rule } from '../../database/entity/rule.entity';
import { CreateRuleDto } from './dto';

@Injectable()
export class RuleService {
  constructor(
    @InjectRepository(Rule)
    private ruleRepository: Repository<Rule>,
  ) {}

  findAll(): Promise<Rule[]> {
    return this.ruleRepository.find();
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

  create(spaceData: CreateRuleDto): Promise<Rule> {
    const space = this.ruleRepository.create(spaceData);
    return this.ruleRepository.save(space);
  }
}
