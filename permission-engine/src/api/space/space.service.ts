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
  FindAllSpaceDto,
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
import { getCountry } from 'countries-and-timezones';
import { countryNameToCode } from 'src/lib/util/locale';

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

  async findAll(
    findAllSpaceDto: FindAllSpaceDto,
  ): Promise<{ data: Space[]; total: number }> {
    const {
      page,
      limit,
      ownerId,
      ruleId,
      topicIds,
      name,
      timezone,
      country,
      region,
      city,
      district,
      address,
    } = findAllSpaceDto;
    const where = [];
    const params: any[] = [(page - 1) * limit, limit];
    let paramIndex: number = params.length;
    // TODO. support sortBy param

    where.push(`s.is_active = true`);

    if (ownerId != null) {
      paramIndex++;
      where.push(`s.organizer_id = $${paramIndex}`);
      params.push(ownerId);
    }

    if (ruleId != null) {
      paramIndex++;
      where.push(`s.rule_id = $${paramIndex}`);
      params.push(ruleId);
    }

    if (topicIds != null) {
      paramIndex++;
      where.push(`t.id = ANY($${paramIndex})`);
      params.push(topicIds);
    }

    if (timezone != null) {
      paramIndex++;
      where.push(`s.timezone = $${paramIndex}`);
      params.push(timezone);
    }

    if (country != null) {
      paramIndex++;
      where.push(`s.country = $${paramIndex}`);
      params.push(country);
    }

    if (region != null) {
      paramIndex++;
      where.push(`s.region = $${paramIndex}`);
      params.push(region);
    }

    if (city != null) {
      paramIndex++;
      where.push(`s.city = $${paramIndex}`);
      params.push(city);
    }

    if (district != null) {
      paramIndex++;
      where.push(`s.district = $${paramIndex}`);
      params.push(district);
    }

    if (address != null) {
      paramIndex++;
      where.push(`s.address LIKE $${paramIndex}`);
      params.push(`%${address}%`);
    }

    if (name != null) {
      paramIndex++;
      where.push(`s.name LIKE $${paramIndex}`);
      params.push(`%${name}%`);
    }

    const query = `
      WITH filtered_data AS (
        SELECT (
          s.id,
          s.owner_id,
          s.name,
          s.zipcode,
          s.country,
          s.city,
          s.region,
          s.district,
          s.address,
          s.latitude,
          s.longitude,
          s.is_active,
          s.rule_id,
          s.details,
          s.link,
          s.timezone,
          s.created_at,
          s.updated_at,
          (
            SELECT 
            json_agg(json_build_object(
              'id', t.id,
              'author_id', t.author_id,
              'name', t.name,
              'icon', t.icon,
              'country', t.country,
              'region', t.region,
              'city', t.city,
              'details', t.details,
              'is_active', t.is_active,
              'created_at', t.created_at,
              'updated_at', t.updated_at
            ))
            FROM 
              topic t,
              space_topic st
            WHERE
              t.id = st.topic_id
            AND
              st.space_id = s.id
          )
        ) FROM 
          space s,
          space_topic st,
          topic t
        WHERE
          s.id = st.space_id
        AND
          st.topic_id = t.id
        AND
        ${where.join(' AND ')}
        GROUP BY s.id
      )
      SELECT COUNT(*) AS total, json_agg(filtered_data) AS data
      FROM filtered_data
      LIMIT $2 OFFSET $1
    `;

    const [{ data, total }] = await this.spaceRepository.query(query, params);

    let result = [];

    if (data != null) {
      result = data.map((item) => {
        let topics = item.row.f19;
        if (topics) {
          topics = topics.map((item) => {
            console.log(item);
            return {
              id: item.id,
              authorId: item.author_id,
              name: item.name,
              icon: item.icon,
              country: item.country,
              region: item.region,
              city: item.city,
              details: item.details,
              isActive: item.is_active,
              createdAt: item.created_at,
              updatedAt: item.updated_at,
            };
          });
        }
        return {
          id: item.row.f1,
          ownerId: item.row.f2,
          name: item.row.f3,
          zipcode: item.row.f4,
          country: item.row.f5,
          city: item.row.f6,
          region: item.row.f7,
          district: item.row.f8,
          address: item.row.f9,
          latitude: item.row.f10,
          longitude: item.row.f11,
          isActive: item.row.f12,
          ruleId: item.row.f13,
          details: item.row.f14,
          link: item.row.f15,
          timezone: item.row.f16,
          createdAt: item.row.f17,
          updatedAt: item.row.f18,
          topics,
        };
      });
    }

    return {
      data: result,
      total: parseInt(total),
    };
  }

  findOneById(
    id: string,
    option: { relations?: string[] } = {},
  ): Promise<Space> {
    const { relations } = option;
    const queryOption: FindOneOptions = {
      where: { id },
    };

    if (Array.isArray(relations)) {
      queryOption.relations = relations;
    }

    return this.spaceRepository.findOne(queryOption);
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
    const { topicIds, country } = createSpaceDto;
    const coutryCode = countryNameToCode(country);
    const countryTimezoneData = getCountry(coutryCode);
    if (countryTimezoneData) {
      createSpaceDto.timezone = countryTimezoneData.timezones[0];
    }
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
        { isActive: true },
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
      const space = await this.findOneById(id, { relations: ['spaceTopics'] });

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
