import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Not, Repository } from 'typeorm';
import { Space } from '../../database/entity/space.entity';
import {
  CreateSpaceDto,
  ReportSpaceIssueDto,
  ResolveSpaceIssueDto,
  UpdateSpaceDto,
} from './dto';
import { User } from 'src/database/entity/user.entity';
import { Rule } from 'src/database/entity/rule.entity';
import { SpacePermissioner } from 'src/database/entity/space-permissioner.entity';
import { v4 as uuidv4 } from 'uuid';
import { RuleBlockType, SpaceHistoryType } from 'src/lib/type';
import { RuleBlock } from 'src/database/entity/rule-block.entity';
import { SpacePermissionerService } from '../space-permissioner/space-permissioner.service';
import { Logger } from 'src/lib/logger/logger.service';
import { SpaceTopicService } from '../space-topic/space-topic.service';
import { SpaceHistoryService } from '../space-history/space-history.service';

@Injectable()
export class SpaceService {
  constructor(
    @InjectRepository(Space)
    private spaceRepository: Repository<Space>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Rule)
    private ruleRepository: Repository<Rule>,
    @InjectRepository(SpacePermissioner)
    private spacePermissionerRepository: Repository<SpacePermissioner>,
    private readonly spacePermissionerService: SpacePermissionerService,
    private readonly spaceTopicService: SpaceTopicService,
    private readonly spaceHistoryService: SpaceHistoryService,
    private readonly logger: Logger,
  ) {}

  // TODO. implement dynamic search in the future
  findAll(): Promise<Space[]> {
    return this.spaceRepository.find();
  }

  findOneById(id: string, relations?: string[]): Promise<Space> {
    const option: FindOneOptions = {
      where: { id },
    };

    if (Array.isArray(relations)) {
      option.relations = relations;
    }

    return this.spaceRepository.findOne(option);
  }

  async findRuleById(id: string): Promise<Rule> {
    const space = await this.spaceRepository.findOneBy({ id });
    const rule = await this.ruleRepository.findOne({
      where: { id: space.ruleId },
      relations: ['ruleBlocks'],
    });

    return rule;
  }

  findOneByName(name: string): Promise<Space> {
    return this.spaceRepository.findOneBy({ name });
  }

  async findAllByRuleId(
    ruleId: string,
  ): Promise<{ data: Space[]; total: number }> {
    const [data, total] = await this.spaceRepository.findAndCount({
      where: { ruleId },
    });

    return {
      data: data ?? [],
      total,
    };
  }

  async remove(id: string): Promise<void> {
    await this.spaceRepository.delete(id);
  }

  async create(
    ownerId: string,
    createSpaceDto: CreateSpaceDto,
  ): Promise<Space> {
    const { topicIds } = createSpaceDto;
    const space = this.spaceRepository.create({
      ...createSpaceDto,
      id: uuidv4(),
      ownerId,
    });

    await this.spaceRepository.save(space);

    try {
      await this.spacePermissionerService.create(
        {
          spaceId: space.id,
          userId: ownerId,
        },
        true,
      );
    } catch (error) {
      this.logger.error(error.message, error);
    }

    if (topicIds) {
      for (const topicId of topicIds) {
        try {
          await this.addTopic(space.id, topicId);
        } catch (error) {
          this.logger.error(error.message, error);
        }
      }
    }

    return space;
  }

  async update(
    id: string,
    updateSpaceDto: UpdateSpaceDto,
  ): Promise<{ data: { result: boolean } }> {
    const { ruleId } = updateSpaceDto;

    if (ruleId != null) {
      const rule = await this.ruleRepository.findOneBy({ id: ruleId });

      if (!rule) {
        throw new BadRequestException(`There is no rule with id: ${ruleId}`);
      }

      const space = await this.spaceRepository.findOneBy({ id });
      const isPermissionerExists =
        await this.spacePermissionerRepository.existsBy({
          spaceId: id,
          isActive: true,
          userId: Not(space.ownerId),
        });

      if (isPermissionerExists === true) {
        throw new ForbiddenException('Cannot update rule whithout permission.');
      }
    }

    const updateResult = await this.spaceRepository.update(id, {
      ...updateSpaceDto,
      updatedAt: new Date(),
    });

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }

  async isOwner(spaceId: string, userId: string): Promise<boolean> {
    return await this.spaceRepository.existsBy({
      id: spaceId,
      ownerId: userId,
    });
  }

  async findPostEventCheckRuleBlocks(id: string): Promise<RuleBlock[]> {
    const rule = await this.findRuleById(id);

    return rule.ruleBlocks.filter(
      (item) => item.type === RuleBlockType.spacePostEventCheck,
    );
  }

  async addTopic(
    id: string,
    topicId: string,
  ): Promise<{ data: { result: boolean } }> {
    let result = false;

    try {
      const space = await this.findOneById(id, ['spaceTopics']);

      if (space.spaceTopics.length >= 20) {
        throw new BadRequestException(`Cannot have more than 20 topics`);
      }

      await this.spaceTopicService
        .create({
          spaceId: id,
          topicId,
        })
        .then((res) => {
          result = !!res;
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
      await this.spaceTopicService
        .remove({
          spaceId: id,
          topicId,
        })
        .then((res) => {
          result = res?.affected === 1;
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

  async reportIssue(
    spaceId: string,
    loggerId: string,
    reportSpaceIssueDto: ReportSpaceIssueDto,
  ) {
    const space = await this.findOneById(spaceId);

    if (!space) {
      throw new BadRequestException();
    }

    return await this.spaceHistoryService.create({
      ...reportSpaceIssueDto,
      spaceId,
      loggerId,
      ruleId: space.ruleId,
      type: SpaceHistoryType.spaceIssue,
    });
  }

  async resolveIssue(
    spaceId: string,
    loggerId: string,
    resolveSpaceIssueDto: ResolveSpaceIssueDto,
  ) {
    const space = await this.findOneById(spaceId);

    if (!space) {
      throw new BadRequestException();
    }

    const spaceHistory = await this.spaceHistoryService.findOneById(
      resolveSpaceIssueDto.spaceHistoryId,
    );

    const { isPublic } = spaceHistory;

    return await this.spaceHistoryService.create({
      ...resolveSpaceIssueDto,
      spaceId,
      loggerId,
      ruleId: space.ruleId,
      type: SpaceHistoryType.spaceIssueResolve,
      isPublic,
    });
  }
}
