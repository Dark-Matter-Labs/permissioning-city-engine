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
import * as Util from 'src/lib/util/util';
import { Logger } from 'src/lib/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import BigNumber from 'bignumber.js';
import { SpaceEquipmentService } from '../space-equipment/space-equipment.service';

@Injectable()
export class RuleBlockService {
  constructor(
    @InjectRepository(RuleBlock)
    private ruleBlockRepository: Repository<RuleBlock>,
    private readonly spaceEquipmentService: SpaceEquipmentService,
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
      case RuleBlockType.spacePostEventCheck:
      case RuleBlockType.spaceEventGeneral:
      case RuleBlockType.spaceEventBenefit:
      case RuleBlockType.spaceEventRisk:
      case RuleBlockType.spaceEventSelfRiskAssesment:
        break;
      case RuleBlockType.spaceMaxNoiseLevel:
      case RuleBlockType.spaceEventNoiseLevel:
        this.validateNoiseLevel(trimmedContent);
        break;
      case RuleBlockType.spaceConsentMethod:
        this.validateSpaceConsentMethod(trimmedContent);
        break;
      case RuleBlockType.spaceConsentTimeout:
        this.validateSpaceConsentTimeout(trimmedContent);
        break;
      case RuleBlockType.spaceAccess:
        this.validateSpaceAccess(trimmedContent);
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
      case RuleBlockType.spaceAvailabilityBuffer:
        this.validateSpaceAvailabilityBuffer(trimmedContent);
        break;
      case RuleBlockType.spacePrePermissionCheck:
        this.validateSpacePrePermissionCheck(trimmedContent);
        break;
      case RuleBlockType.spaceEventAccess:
        this.validateSpaceEventAccess(trimmedContent);
        break;
      case RuleBlockType.spaceEventRequireEquipment:
        await this.validateSpaceEventRequireEquipment(trimmedContent);
        break;
      case RuleBlockType.spaceEventExpectedAttendeeCount:
        this.validateSpaceEventExpectedAttendeeCount(trimmedContent);
        break;
      case RuleBlockType.spaceEventException:
        await this.validateSpaceEventException(trimmedContent);
        break;
      case RuleBlockType.spaceEventInsurance:
        this.validateSpaceEventInsurance(files);
        break;
      case RuleBlockType.spaceEventPrePermissionCheckAnswer:
        await this.validateSpaceEventPrePermissionCheckAnswer(trimmedContent);
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
      isPublic: type === RuleBlockType.spaceEventInsurance ? false : true,
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

  private validateSpaceAccess(content: string) {
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

  private async validateSpaceEventExpectedAttendeeCount(content: string) {
    if (content !== parseInt(content).toString(10)) {
      throw new BadRequestException(`Content must be an integer`);
    }
  }

  private async validateSpaceEventException(content: string) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [spaceRuleBlockHash, desiredValue, _reason] = content.split(
      RuleBlockContentDivider.type,
    );
    const spaceRuleBlocks =
      (await this.findAll({ hash: spaceRuleBlockHash, page: 1, limit: 1 }))
        ?.data ?? [];

    if (spaceRuleBlocks.length === 0) {
      throw new BadRequestException(
        `There is no space ruleBlock with hash: ${spaceRuleBlockHash}`,
      );
    } else if (content.split(RuleBlockContentDivider.type).length !== 3) {
      throw new BadRequestException(
        `content must be in format: {spaceRuleBlockHash}${RuleBlockContentDivider.type}{desiredValue}${RuleBlockContentDivider.type}{reason}`,
      );
    } else {
      const { type, content } = spaceRuleBlocks[0];

      if (type === RuleBlockType.spaceAccess) {
        this.validateSpaceEventAccess(desiredValue);

        if (
          content.split(RuleBlockContentDivider.array).includes(desiredValue)
        ) {
          throw new BadRequestException(`${desiredValue} is already allowed`);
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

  private async validateSpaceEventPrePermissionCheckAnswer(content: string) {
    const dividedContent = content?.split(RuleBlockContentDivider.type) ?? [];
    const [spaceRuleBlockHash, answer] = dividedContent;

    if (dividedContent.length !== 2) {
      throw new BadRequestException(
        `Content must be in format: {spaceRuleBlockHash}^{true|false}`,
      );
    }

    const spaceRuleBlocks =
      (await this.findAll({ hash: spaceRuleBlockHash, page: 1, limit: 1 }))
        ?.data ?? [];

    if (spaceRuleBlocks.length === 0) {
      throw new BadRequestException(
        `There is no space ruleBlock with id: ${spaceRuleBlockHash}`,
      );
    }

    if (
      spaceRuleBlocks.find(
        (item) => item.type !== RuleBlockType.spacePrePermissionCheck,
      )
    ) {
      throw new BadRequestException(
        `The space ruleBlock is not ${RuleBlockType.spacePrePermissionCheck} type`,
      );
    }

    if (['true', 'false'].includes(answer) === false) {
      throw new BadRequestException('Answer must be boolean');
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
