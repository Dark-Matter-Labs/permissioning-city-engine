import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsWhere, In, Repository } from 'typeorm';
import { CreateTopicDto, FindAllTopicDto, UpdateTopicDto } from './dto';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from 'src/lib/logger/logger.service';
import { Topic } from 'src/database/entity/topic.entity';
import { SpaceService } from '../space/space.service';
import { RuleService } from '../rule/rule.service';
import { SpaceEventService } from '../space-event/space-event.service';

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(Topic)
    private topicRepository: Repository<Topic>,
    private readonly spaceService: SpaceService,
    private readonly spaceEventService: SpaceEventService,
    private readonly ruleService: RuleService,
    private readonly logger: Logger,
  ) {}

  async findAll(
    findAllTopicDto: FindAllTopicDto,
    isPagination: boolean = true,
  ): Promise<{ data: Topic[]; total: number }> {
    const { page, limit, isActive, names, ids, country, region, city } =
      findAllTopicDto;

    const where: FindOptionsWhere<Topic> = {};

    if (ids != null) {
      where.id = In(ids);
    }

    if (names != null) {
      where.name = In(names);
    }

    if (country != null) {
      where.country = country;
    }

    if (region != null) {
      where.region = region;
    }

    if (city != null) {
      where.city = city;
    }

    if (isActive != null) {
      where.isActive = isActive;
    }

    let queryOption: FindManyOptions<Topic> = { where };
    if (isPagination === true) {
      queryOption = {
        ...queryOption,
        skip: (page - 1) * limit,
        take: limit,
      };
    }

    const [data, total] = await this.topicRepository.findAndCount(queryOption);

    return {
      data: data ?? [],
      total,
    };
  }

  async findAllBySpaceId(
    spaceId: string,
  ): Promise<{ data: Topic[]; total: number }> {
    const where = [];
    const params: any[] = [];
    let paramIndex: number = params.length;

    if (spaceId != null) {
      paramIndex++;
      where.push(`t.space_id = $${paramIndex}`);
      params.push(spaceId);
    }

    const query = `
      WITH filtered_data AS (
        SELECT (
            t.id,
            t.authorId,
            t.name,
            t.country,
            t.region,
            t.city,
            t.details,
            t.isActive,
            t.createdAt,
            t.updatedAt
        ) FROM topic t, space_topic st
        WHERE t.id = st.topic_id AND ${where.join(' AND ')}
        GROUP BY t.id
      )
      SELECT COUNT(*) AS total, json_agg(filtered_data) AS data
      FROM filtered_data;
    `;

    const [{ data, total }] = await this.topicRepository.query(query, params);

    let result = [];

    if (data != null) {
      result = data.map((item) => {
        return {
          id: item.row.f1,
          authorId: item.row.f2,
          name: item.row.f3,
          country: item.row.f4,
          region: item.row.f5,
          city: item.row.f6,
          details: item.row.f7,
          isActive: item.row.f8,
          createdAt: item.row.f9,
          updatedAt: item.row.f10,
        };
      });
    }

    return {
      data: result,
      total: parseInt(total),
    };
  }

  async findAllBySpaceEventId(
    spaceEventId: string,
  ): Promise<{ data: Topic[]; total: number }> {
    const where = [];
    const params: any[] = [];
    let paramIndex: number = params.length;

    if (spaceEventId != null) {
      paramIndex++;
      where.push(`t.space_event_id = $${paramIndex}`);
      params.push(spaceEventId);
    }

    const query = `
      WITH filtered_data AS (
        SELECT (
            t.id,
            t.authorId,
            t.name,
            t.country,
            t.region,
            t.city,
            t.details,
            t.isActive,
            t.createdAt,
            t.updatedAt
        ) FROM topic t, space_event_topic set
        WHERE t.id = set.topic_id AND ${where.join(' AND ')}
        GROUP BY t.id
      )
      SELECT COUNT(*) AS total, json_agg(filtered_data) AS data
      FROM filtered_data;
    `;

    const [{ data, total }] = await this.topicRepository.query(query, params);

    let result = [];

    if (data != null) {
      result = data.map((item) => {
        return {
          id: item.row.f1,
          authorId: item.row.f2,
          name: item.row.f3,
          country: item.row.f4,
          region: item.row.f5,
          city: item.row.f6,
          details: item.row.f7,
          isActive: item.row.f8,
          createdAt: item.row.f9,
          updatedAt: item.row.f10,
        };
      });
    }

    return {
      data: result,
      total: parseInt(total),
    };
  }

  async findAllByRuleId(
    ruleId: string,
  ): Promise<{ data: Topic[]; total: number }> {
    const where = [];
    const params: any[] = [];
    let paramIndex: number = params.length;

    if (ruleId != null) {
      paramIndex++;
      where.push(`t.rule_id = $${paramIndex}`);
      params.push(ruleId);
    }

    const query = `
      WITH filtered_data AS (
        SELECT (
            t.id,
            t.authorId,
            t.name,
            t.country,
            t.region,
            t.city,
            t.details,
            t.isActive,
            t.createdAt,
            t.updatedAt
        ) FROM topic t, rule_topic rt
        WHERE t.id = rt.topic_id AND ${where.join(' AND ')}
        GROUP BY t.id
      )
      SELECT COUNT(*) AS total, json_agg(filtered_data) AS data
      FROM filtered_data;
    `;

    const [{ data, total }] = await this.topicRepository.query(query, params);

    let result = [];

    if (data != null) {
      result = data.map((item) => {
        return {
          id: item.row.f1,
          authorId: item.row.f2,
          name: item.row.f3,
          country: item.row.f4,
          region: item.row.f5,
          city: item.row.f6,
          details: item.row.f7,
          isActive: item.row.f8,
          createdAt: item.row.f9,
          updatedAt: item.row.f10,
        };
      });
    }

    return {
      data: result,
      total: parseInt(total),
    };
  }

  findOneById(id: string): Promise<Topic> {
    return this.topicRepository.findOne({
      where: {
        id,
      },
      relations: ['spaceTopics', 'rules', 'spaceEvents'],
    });
  }

  async remove(id: string): Promise<void> {
    await this.topicRepository.delete(id);
  }

  async create(
    authorId: string,
    createTopicDto: CreateTopicDto,
  ): Promise<Topic> {
    const topic = this.topicRepository.create({
      ...createTopicDto,
      id: uuidv4(),
      authorId,
      isActive: true,
    });

    return this.topicRepository.save(topic);
  }

  async update(
    id: string,
    updateTopicDto: UpdateTopicDto,
  ): Promise<{ data: { result: boolean } }> {
    const updateResult = await this.topicRepository.update(id, {
      ...updateTopicDto,
      updatedAt: new Date(),
    });

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }

  async updateToActive(id: string): Promise<{ data: { result: boolean } }> {
    const updateResult = await this.topicRepository.update(id, {
      isActive: true,
      updatedAt: new Date(),
    });

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }

  async updateToInActive(id: string): Promise<{ data: { result: boolean } }> {
    const updateResult = await this.topicRepository.update(id, {
      isActive: false,
      updatedAt: new Date(),
    });

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }
}
