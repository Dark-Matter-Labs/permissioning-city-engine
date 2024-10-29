import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { RuleBlock } from '../../database/entity/rule-block.entity';
import { CreateRuleBlockDto, FindAllRuleBlockDto } from './dto';
import { RuleBlockType } from 'src/lib/type';
import * as Util from 'src/lib/util/util';
import { Logger } from 'src/lib/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import BigNumber from 'bignumber.js';

@Injectable()
export class RuleBlockService {
  constructor(
    @InjectRepository(RuleBlock)
    private ruleBlockRepository: Repository<RuleBlock>,
    private logger: Logger,
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

  findOneById(id: string): Promise<RuleBlock> {
    return this.ruleBlockRepository.findOneBy({ id });
  }

  async remove(id: string): Promise<void> {
    await this.ruleBlockRepository.delete(id);
  }

  async create(
    authorId: string,
    createRuleBlockDto: CreateRuleBlockDto,
  ): Promise<RuleBlock> {
    const { type, content, name, files } = createRuleBlockDto;

    if (content == null) {
      throw new BadRequestException('Should provide content');
    }

    const trimmedContent = content?.trim();
    const trimmedName = name.trim();
    const hash = Util.hash([type, trimmedName, trimmedContent].join(':'));

    const ruleBlock = await this.ruleBlockRepository.findOneBy({ hash });

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

    if (type === RuleBlockType.spaceAvailability) {
      const availableDays = trimmedContent
        .toLowerCase()
        .split(';')
        .filter((item) => item != null && item !== '');
      const testRegex =
        /^(mon|tue|wed|thu|fri|sat|sun)-\d{2}:(00|30)-\d{2}:(00|30)/;
      // validity check
      // No duplicate datetime range
      // start < end
      const openingDates = {
        mon: [],
        tue: [],
        wed: [],
        thu: [],
        fri: [],
        sat: [],
        sun: [],
      };

      availableDays.forEach((availability) => {
        const [day, startTime, endTime] = availability.split('-');
        const [startHour, startMinute] = startTime.split(':');
        const [endHour, endMinute] = endTime.split(':');

        if (testRegex.test(availability) === false) {
          throw new BadRequestException(
            `Availability does not match format: /^(mon|tue|wed|thu|fri|sat|sun)-\d{2}:\d{2}-\d{2}:\d{2}/`,
          );
        }
        if (
          // check if starts after endtime
          new BigNumber(`${startHour}${startMinute}`).gte(
            `${endHour}${endMinute}`,
          )
        ) {
          throw new BadRequestException(`Cannot start after end time`);
        }

        const invalidOpeningDateTime = openingDates[day].find((item) => {
          return (
            // check if ends after other time starts
            new BigNumber(item[0]).lte(`${endHour}${endMinute}`) ||
            // check if starts before other time ends
            new BigNumber(item[1]).gte(`${startHour}${startMinute}`)
          );
        });

        if (invalidOpeningDateTime) {
          throw new BadRequestException(
            `Invalid availability value: ${JSON.stringify(invalidOpeningDateTime)}`,
          );
        } else {
          openingDates[day].push([
            `${startHour}${startMinute}`,
            `${endHour}${endMinute}`,
          ]);
        }
      });
    }

    if (type === RuleBlockType.spaceAvailabilityUnit) {
      if (['30m', '1h', '1d'].includes(trimmedContent) === false) {
        throw new BadRequestException(
          'Space availability unit must be one of: 30m, 1h, 1d',
        );
      }
    }

    if (type === RuleBlockType.spaceEventInsurance) {
      if (files.length === 0) {
        throw new BadRequestException('Should provide file for insurance');
      }
    }

    if (type === RuleBlockType.spaceEventPrePermissionCheckAnswer) {
      const [spaceRuleBlockId, answer] = trimmedContent.split(':');
      const spaceRuleBlock = await this.findOneById(spaceRuleBlockId);

      if (!spaceRuleBlock) {
        throw new BadRequestException(
          `There is no space ruleBlock with id: ${spaceRuleBlockId}`,
        );
      }

      if (spaceRuleBlock.type !== RuleBlockType.spacePrePermissionCheck) {
        throw new BadRequestException(
          `The space ruleBlock is not ${RuleBlockType.spacePrePermissionCheck} type`,
        );
      }

      if (['true', 'false'].includes(answer) === false) {
        throw new BadRequestException('Answer must be boolean');
      }
    }

    const newRuleBlock = this.ruleBlockRepository.create({
      ...createRuleBlockDto,
      id: createRuleBlockDto.id ?? uuidv4(),
      authorId,
      content: trimmedContent,
      name: trimmedName,
      hash,
    });

    return this.ruleBlockRepository.save(newRuleBlock);
  }
}
