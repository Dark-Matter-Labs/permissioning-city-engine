import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { RuleBlock } from '../../database/entity/rule-block.entity';
import { CreateRuleBlockDto, FindAllRuleBlockDto } from './dto';
import {
  NoiseLevel,
  RuleBlockContentDivider,
  RuleBlockType,
  SpaceEventAccessType,
} from 'src/lib/type';
import * as Util from 'src/lib/util';
import { Logger } from 'src/lib/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import BigNumber from 'bignumber.js';
import { SpaceEquipmentService } from '../space-equipment/space-equipment.service';
import { TopicService } from '../topic/topic.service';

@Injectable()
export class RuleBlockService {
  constructor(
    @InjectRepository(RuleBlock)
    private ruleBlockRepository: Repository<RuleBlock>,
    private readonly spaceEquipmentService: SpaceEquipmentService,
    private readonly topicService: TopicService,
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

    const trimmedContent = content?.trim() ?? '';
    const trimmedName = name.trim();
    // omit after 3rd item in the splitted array: which is reason
    const contentSplitByType = trimmedContent.split(
      RuleBlockContentDivider.type,
    );
    const [contentKey, contentValue] = contentSplitByType;
    const hash = Util.hash(
      [
        type,
        contentSplitByType.length > 2
          ? [contentKey, contentValue].join(RuleBlockContentDivider.type)
          : trimmedContent,
      ].join(RuleBlockContentDivider.type),
    );

    switch (type) {
      case RuleBlockType.spaceGeneral:
      case RuleBlockType.spaceGuide:
      case RuleBlockType.spacePrivateGuide:
      case RuleBlockType.spacePostEventCheck:
      case RuleBlockType.spaceEventGeneral:
      case RuleBlockType.spaceEventBenefit:
      case RuleBlockType.spaceEventRisk:
      case RuleBlockType.spaceEventSelfRiskAssesment:
        break;
      case RuleBlockType.spaceExcludedTopic:
        await this.validateSpaceExcludedTopic(trimmedContent);
        break;
      case RuleBlockType.spaceMaxNoiseLevel:
        this.validateNoiseLevel(trimmedContent);
        break;
      case RuleBlockType.spaceConsentMethod:
        this.validateSpaceConsentMethod(trimmedContent);
        break;
      case RuleBlockType.spaceConsentTimeout:
        this.validateSpaceConsentTimeout(trimmedContent);
        break;
      case RuleBlockType.spaceCancelDeadline:
        this.validateSpaceCancelDeadline(trimmedContent);
        break;
      case RuleBlockType.spaceAllowedEventAccessType:
        this.validateSpaceAllowedEventAccessType(trimmedContent);
        break;
      case RuleBlockType.spaceMaxAttendee:
        this.validateSpaceMaxAttendee(trimmedContent);
        break;
      case RuleBlockType.spaceAvailability:
        this.validateSpaceAvailability(trimmedContent);
        break;
      case RuleBlockType.spaceAvailabilityUnit:
        this.validateSpaceAvailabilityUnit(trimmedContent);
        break;
      case RuleBlockType.spaceMaxAvailabilityUnitCount:
        this.validateSpaceAvailabilityUnitCount(trimmedContent);
        break;
      case RuleBlockType.spaceAvailabilityBuffer:
        this.validateSpaceAvailabilityBuffer(trimmedContent);
        break;
      case RuleBlockType.spacePrePermissionCheck:
        this.validateSpacePrePermissionCheck(trimmedContent);
        break;
      case RuleBlockType.spaceEventRequireEquipment:
        await this.validateSpaceEventRequireEquipment(trimmedContent);
        break;
      case RuleBlockType.spaceEventException:
        await this.validateSpaceEventException(trimmedContent);
        break;
      case RuleBlockType.spaceEventInsurance:
        this.validateSpaceEventInsurance(files);
        break;

      default:
        throw new BadRequestException(`Unsupported RuleBlockType: ${type}`);
        break;
    }

    const newRuleBlock = this.ruleBlockRepository.create({
      ...createRuleBlockDto,
      id: createRuleBlockDto.id ?? uuidv4(),
      authorId,
      content: trimmedContent,
      name: trimmedName,
      hash,
      isPublic:
        [
          RuleBlockType.spaceEventInsurance,
          RuleBlockType.spaceEventRequireEquipment,
          RuleBlockType.spacePrivateGuide,
        ].includes(type) === true
          ? false
          : true,
    });

    return this.ruleBlockRepository.save(newRuleBlock);
  }

  private validateSpaceConsentMethod(content: string) {
    const testRegex = /^(under|over|is):(100|[1-9]?[0-9]):(yes|no)$/;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [operator, percent, _flag] = content.split(
      RuleBlockContentDivider.operator,
    );
    if (
      testRegex.test(content) === false ||
      (operator === 'under' && parseInt(percent) === 0) ||
      (operator === 'over' && parseInt(percent) === 100) ||
      parseInt(percent) > 100 ||
      parseInt(percent) < 0
    ) {
      throw new BadRequestException(
        `Consent condition must be in format: {under|over|is}${RuleBlockContentDivider.operator}{percent}${RuleBlockContentDivider.operator}{yes|no}`,
      );
    }
  }

  private validateSpaceConsentTimeout(content: string) {
    const testRegex = /^\d+[dh]$/;
    if (testRegex.test(content) === false) {
      throw new BadRequestException(
        'Space consent timeout must be in format: {number}{d|h}',
      );
    }
  }

  private validateSpaceAllowedEventAccessType(content: string) {
    const accessTypes = content.split(RuleBlockContentDivider.array);
    accessTypes.forEach((item) => {
      this.validateSpaceEventAccess(item);
    });
  }

  private validateSpaceMaxAttendee(content: string) {
    if (content !== parseInt(content).toString(10)) {
      throw new BadRequestException('Content must be an integer');
    }
  }

  private validateSpaceAvailability(content: string) {
    const availableDays = content
      .toLowerCase()
      .split(RuleBlockContentDivider.array)
      .filter((item) => item != null && item !== '');
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
      this.validateSpaceAvailabilityItem(availability);

      const [day, startTime, endTime] = availability.split(
        RuleBlockContentDivider.time,
      );
      const [startHour, startMinute] = startTime.split(':');
      const [endHour, endMinute] = endTime.split(':');
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

  private validateSpaceAvailabilityItem(content: string) {
    const testRegex = /^(mon|tue|wed|thu|fri|sat|sun)-\d{2}:\d{2}-\d{2}:\d{2}/;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_day, startTime, endTime] = content.split(
      RuleBlockContentDivider.time,
    );
    const [startHour, startMinute] = startTime.split(':');
    const [endHour, endMinute] = endTime.split(':');

    if (testRegex.test(content) === false) {
      throw new BadRequestException(
        `Availability does not match format: /^(mon|tue|wed|thu|fri|sat|sun)-\d{2}:\d{2}-\d{2}:\d{2}/`,
      );
    }
    if (
      // check if starts after endtime
      new BigNumber(`${startHour}${startMinute}`).gte(`${endHour}${endMinute}`)
    ) {
      throw new BadRequestException(`Cannot start after end time`);
    }
  }

  private validateSpaceAvailabilityUnit(content: string) {
    const testRegex = /^\d+[dhm]$/;
    if (testRegex.test(content) === false) {
      throw new BadRequestException(
        'Space availability unit must be in format: {number}{d|h|m}',
      );
    }
  }

  private validateSpaceCancelDeadline(content: string) {
    const testRegex = /^\d+[dhm]$/;
    if (testRegex.test(content) === false) {
      throw new BadRequestException(
        'Space cancel deadline must be in format: {number}{d|h|m}',
      );
    }
  }

  private validateSpaceAvailabilityUnitCount(content: string) {
    const isInteger = Number.isInteger(new BigNumber(content).toNumber());

    if (
      (isInteger &&
        new BigNumber(content).gte(1) &&
        new BigNumber(content).lte(60)) === false
    ) {
      throw new BadRequestException(
        'Space max availability unit count must be an integer between 1 and 60',
      );
    }
  }

  private validateSpaceAvailabilityBuffer(content: string) {
    const testRegex = /^\d+[dwMyhms]$/;

    if (testRegex.test(content) === false) {
      throw new BadRequestException(
        'Space availability buffer must be in format: {number}{d|w|M|y|h|m|s}',
      );
    }
  }

  private validateSpacePrePermissionCheck(content: string) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_question, answer] = content.split(RuleBlockContentDivider.type);

    if (
      !['true', 'false'].includes(answer) ||
      content.split(RuleBlockContentDivider.type).length > 2
    ) {
      throw new BadRequestException(
        `Space pre permission check must be in format: {boolean question}${RuleBlockContentDivider.type}{default answer in boolean}`,
      );
    }
  }

  private validateSpaceEventAccess(content: string) {
    if (
      ![
        SpaceEventAccessType.publicFree as string,
        SpaceEventAccessType.publicPaid as string,
        SpaceEventAccessType.privateFree as string,
        SpaceEventAccessType.privatePaid as string,
      ].includes(content)
    ) {
      throw new BadRequestException(
        `SpaceEvent access type must be in format: {public|invited}${RuleBlockContentDivider.operator}{free|paid}`,
      );
    }
  }

  private async validateSpaceEventRequireEquipment(content: string) {
    const [spaceEquipmentId, quantity] = content.split(
      RuleBlockContentDivider.type,
    );
    const spaceEquipment =
      await this.spaceEquipmentService.findOneById(spaceEquipmentId);

    if (!spaceEquipment) {
      throw new BadRequestException(
        `There is no spaceEquipment with id: ${spaceEquipmentId}`,
      );
    }

    if (new BigNumber(quantity).gt(spaceEquipment.quantity)) {
      throw new BadRequestException(
        `The given quantity exceeds the spaceEquipment quantity`,
      );
    }
  }

  private async validateSpaceExcludedTopic(content: string) {
    const topic = await this.topicService.findOneById(content);

    if (!topic) {
      throw new BadRequestException(`There is no topic with id: ${content}`);
    }
  }

  private async validateSpaceEventException(content: string) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [spaceRuleBlockHash, desiredValue, _reason] = content.split(
      RuleBlockContentDivider.type,
    );
    const [spaceRuleBlock] =
      (await this.findAll({ hash: spaceRuleBlockHash, page: 1, limit: 1 }))
        ?.data ?? [];

    if (!spaceRuleBlock) {
      throw new BadRequestException(
        `There is no space ruleBlock with hash: ${spaceRuleBlockHash}`,
      );
    } else if (content.split(RuleBlockContentDivider.type).length !== 3) {
      throw new BadRequestException(
        `content must be in format: {spaceRuleBlockHash}${RuleBlockContentDivider.type}{desiredValue}${RuleBlockContentDivider.type}{reason}`,
      );
    } else {
      const { type, content } = spaceRuleBlock;

      if (type === RuleBlockType.spaceAllowedEventAccessType) {
        this.validateSpaceAllowedEventAccessType(desiredValue);

        const allowedEventAccessTypes = content.split(
          RuleBlockContentDivider.array,
        );

        while (allowedEventAccessTypes.length > 0) {
          const eventAccessType = allowedEventAccessTypes.pop();
          if (
            desiredValue
              .split(RuleBlockContentDivider.array)
              .includes(eventAccessType) === true
          ) {
            throw new BadRequestException(
              `${eventAccessType} is already allowed`,
            );
          }
        }
      } else if (type === RuleBlockType.spaceMaxAttendee) {
        this.validateSpaceMaxAttendee(desiredValue);

        if (new BigNumber(content).gte(desiredValue)) {
          throw new BadRequestException(`${desiredValue} is already allowed`);
        }
      } else if (type === RuleBlockType.spaceAvailability) {
        this.validateSpaceAvailability(desiredValue);
      } else if (type === RuleBlockType.spaceAvailabilityUnit) {
        this.validateSpaceAvailabilityUnit(desiredValue);
      } else if (type === RuleBlockType.spaceAvailabilityBuffer) {
        this.validateSpaceAvailabilityBuffer(desiredValue);
      } else if (type === RuleBlockType.spacePrePermissionCheck) {
        if (desiredValue !== 'false') {
          throw new BadRequestException(
            `desiredValue must be false in this case: ${desiredValue} given`,
          );
        }
      } else if (type === RuleBlockType.spacePostEventCheck) {
      } else if (type === RuleBlockType.spaceGeneral) {
      } else {
        throw new BadRequestException(
          `Unsupported exception target type: ${type}`,
        );
      }
    }
  }

  private validateSpaceEventInsurance(files: Express.Multer.File[]) {
    if (files.length === 0) {
      throw new BadRequestException('Should provide file for insurance');
    }
  }

  private validateNoiseLevel(content: string) {
    if (
      [
        NoiseLevel.high as string,
        NoiseLevel.medium as string,
        NoiseLevel.low as string,
      ].includes(content) === false
    ) {
      throw new BadRequestException(
        `Noise level must be one of: high | medium | low`,
      );
    }
  }
}
