import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateTopicDto,
  FindAllSpaceAssignedTopicDto,
  FindAllTopicDto,
  UpdateTopicDto,
} from './dto';
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
    option: { isPagination: boolean } = { isPagination: true },
  ): Promise<{ data: Topic[]; total: number }> {
    const { page, limit, isActive, names, ids, country, region, city } =
      findAllTopicDto;
    const { isPagination } = option;
    const where = [];
    const params: any[] =
      isPagination === true ? [(page - 1) * limit, limit] : [];
    let paramIndex: number = params.length;

    if (ids != null) {
      paramIndex++;
      where.push(`id = ANY($${paramIndex})`);
      params.push(ids);
    }
    if (country != null) {
      paramIndex++;
      where.push(`country = $${paramIndex}`);
      params.push(country);
    }

    if (region != null) {
      paramIndex++;
      where.push(`region = $${paramIndex}`);
      params.push(region);
    }

    if (city != null) {
      paramIndex++;
      where.push(`city = $${paramIndex}`);
      params.push(city);
    }

    if (isActive != null) {
      paramIndex++;
      where.push(`is_active = $${paramIndex}`);
      params.push(isActive);
    }

    if (names != null) {
      const namesOr = [];
      names.forEach((name) => {
        paramIndex++;
        namesOr.push(`name LIKE $${paramIndex}`);
        namesOr.push(`translation LIKE $${paramIndex}`);
        params.push(`%${name}%`);
      });
      where.push(`(${namesOr.join(' OR ')})`);
    }

    const query = `
      WITH filtered_data AS (
        SELECT (
          id,
          author_id,
          name,
          translation,
          icon,
          country,
          region,
          city,
          details,
          is_active,
          created_at,
          updated_at
        ) FROM topic
        ${where.length > 0 ? ' WHERE ' : ''} 
        ${where.join(' AND ')}
      ),
      paginated_data AS (
        SELECT * FROM filtered_data
        ${isPagination === true ? 'LIMIT $2 OFFSET $1' : ''}
      )
      SELECT 
        (SELECT COUNT(*) FROM filtered_data) AS total,
        json_agg(paginated_data) AS data
      FROM paginated_data;
    `;

    const [{ data, total }] = await this.topicRepository.query(query, params);
    let result = [];

    if (data != null) {
      result = data.map((item) => {
        let translation = item.row.f4;

        if (translation) {
          translation = JSON.parse(translation);
        }

        return {
          id: item.row.f1,
          authorId: item.row.f2,
          name: item.row.f3,
          translation,
          icon: item.row.f5,
          country: item.row.f6,
          region: item.row.f7,
          city: item.row.f8,
          details: item.row.f9,
          isActive: item.row.f10,
          createdAt: item.row.f11,
          updatedAt: item.row.f12,
        };
      });
    }
    return {
      data: result,
      total: parseInt(total),
    };
  }

  async findAllSpaceAssigned(
    findAllSpaceAssignedTopicDto: FindAllSpaceAssignedTopicDto,
  ): Promise<{ data: Topic[]; total: number }> {
    const { page, limit, isActive, country, region, city } =
      findAllSpaceAssignedTopicDto;
    const where = [];
    const params: any[] = [(page - 1) * limit, limit];
    let paramIndex: number = params.length;

    if (country != null) {
      paramIndex++;
      where.push(`country = $${paramIndex}`);
      params.push(country);
    }

    if (region != null) {
      paramIndex++;
      where.push(`region = $${paramIndex}`);
      params.push(region);
    }

    if (city != null) {
      paramIndex++;
      where.push(`city = $${paramIndex}`);
      params.push(city);
    }

    if (isActive != null) {
      paramIndex++;
      where.push(`t.is_active = $${paramIndex}`);
      params.push(isActive);
    }

    // TODO. remove temporary created_at limit
    const query = `
      WITH filtered_data AS (
        SELECT (
          t.id,
          t.author_id,
          t.name,
          t.translation,
          t.icon,
          t.country,
          t.region,
          t.city,
          t.details,
          t.is_active,
          t.created_at,
          t.updated_at
        ) FROM topic t, space_topic st
        WHERE t.id = st.topic_id
        AND st.created_at > '2024-11-26'
        ${where.length > 0 ? ' AND ' : ''} 
        ${where.join(' AND ')}
        GROUP BY t.id
      ),
      paginated_data AS (
        SELECT * FROM filtered_data
        LIMIT $2 OFFSET $1
      )
      SELECT 
        (SELECT COUNT(*) FROM filtered_data) AS total,
        json_agg(paginated_data) AS data
      FROM paginated_data;
    `;

    const [{ data, total }] = await this.topicRepository.query(query, params);
    let result = [];

    if (data != null) {
      result = data.map((item) => {
        let translation = item.row.f4;

        if (translation) {
          translation = JSON.parse(translation);
        }

        return {
          id: item.row.f1,
          authorId: item.row.f2,
          name: item.row.f3,
          translation,
          icon: item.row.f5,
          country: item.row.f6,
          region: item.row.f7,
          city: item.row.f8,
          details: item.row.f9,
          isActive: item.row.f10,
          createdAt: item.row.f11,
          updatedAt: item.row.f12,
        };
      });
    }
    return {
      data: result,
      total: parseInt(total),
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
      where.push(`st.space_id = $${paramIndex}`);
      params.push(spaceId);
    }

    const query = `
      WITH filtered_data AS (
        SELECT (
            t.id,
            t.author_id,
            t.name,
            t.icon,
            t.country,
            t.region,
            t.city,
            t.details,
            t.is_active,
            t.created_at,
            t.updated_at,
            t.translation
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
        let translation = item.row.f12;

        if (translation) {
          translation = JSON.parse(translation);
        }

        return {
          id: item.row.f1,
          authorId: item.row.f2,
          name: item.row.f3,
          icon: item.row.f4,
          country: item.row.f5,
          region: item.row.f6,
          city: item.row.f7,
          details: item.row.f8,
          isActive: item.row.f9,
          createdAt: item.row.f10,
          updatedAt: item.row.f11,
          translation,
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
      where.push(`set.space_event_id = $${paramIndex}`);
      params.push(spaceEventId);
    }

    const query = `
      WITH filtered_data AS (
        SELECT (
            t.id,
            t.author_id,
            t.name,
            t.icon,
            t.country,
            t.region,
            t.city,
            t.details,
            t.is_active,
            t.created_at,
            t.updated_at,
            t.translation
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
        let translation = item.row.f12;

        if (translation) {
          try {
            translation = JSON.parse(translation);
          } catch (e) {}
        }

        return {
          id: item.row.f1,
          authorId: item.row.f2,
          name: item.row.f3,
          icon: item.row.f4,
          country: item.row.f5,
          region: item.row.f6,
          city: item.row.f7,
          details: item.row.f8,
          isActive: item.row.f9,
          createdAt: item.row.f10,
          updatedAt: item.row.f11,
          translation,
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
      where.push(`rt.rule_id = $${paramIndex}`);
      params.push(ruleId);
    }

    const query = `
      WITH filtered_data AS (
        SELECT (
            t.id,
            t.author_id,
            t.name,
            t.icon,
            t.country,
            t.region,
            t.city,
            t.details,
            t.is_active,
            t.created_at,
            t.updated_at,
            t.translation
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
        let translation = item.row.f12;

        if (translation) {
          translation = JSON.parse(translation);
        }

        return {
          id: item.row.f1,
          authorId: item.row.f2,
          name: item.row.f3,
          icon: item.row.f4,
          country: item.row.f5,
          region: item.row.f6,
          city: item.row.f7,
          details: item.row.f8,
          isActive: item.row.f9,
          createdAt: item.row.f10,
          updatedAt: item.row.f11,
          translation,
        };
      });
    }

    return {
      data: result,
      total: parseInt(total),
    };
  }

  async findAllByUserId(
    userId: string,
  ): Promise<{ data: Topic[]; total: number }> {
    const where = [];
    const params: any[] = [];
    let paramIndex: number = params.length;

    if (userId != null) {
      paramIndex++;
      where.push(`ut.user_id = $${paramIndex}`);
      params.push(userId);
    }

    const query = `
      WITH filtered_data AS (
        SELECT (
            t.id,
            t.author_id,
            t.name,
            t.icon,
            t.country,
            t.region,
            t.city,
            t.details,
            t.is_active,
            t.created_at,
            t.updated_at,
            t.translation
        ) FROM topic t, user_topic ut
        WHERE t.id = ut.topic_id AND ${where.join(' AND ')}
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
          icon: item.row.f4,
          country: item.row.f5,
          region: item.row.f6,
          city: item.row.f7,
          details: item.row.f8,
          isActive: item.row.f9,
          createdAt: item.row.f10,
          updatedAt: item.row.f11,
          translation: item.row.f12,
        };
      });
    }

    return {
      data: result,
      total: parseInt(total),
    };
  }

  async findOneById(id: string): Promise<Topic> {
    const topic = await this.topicRepository.findOne({
      where: {
        id,
      },
      relations: ['spaceTopics', 'rules', 'spaceEvents'],
    });

    let translation = topic?.translation;

    if (translation) {
      try {
        translation = JSON.parse(translation);
      } catch (error) {}

      topic.translation = translation;
    }

    return topic;
  }

  async remove(id: string): Promise<void> {
    await this.topicRepository.delete(id);
  }

  async create(
    authorId: string,
    createTopicDto: CreateTopicDto,
  ): Promise<Topic> {
    const { translation } = createTopicDto;
    const topic = this.topicRepository.create({
      ...createTopicDto,
      id: uuidv4(),
      authorId,
      name: createTopicDto.name.toLowerCase(),
      translation: translation ? JSON.stringify(translation) : null,
      isActive: true,
    });

    return this.topicRepository.save(topic);
  }

  async update(
    id: string,
    updateTopicDto: UpdateTopicDto,
  ): Promise<{ data: { result: boolean } }> {
    const { translation } = updateTopicDto;
    const updateResult = await this.topicRepository.update(id, {
      ...updateTopicDto,
      translation: translation ? JSON.stringify(translation) : null,
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
