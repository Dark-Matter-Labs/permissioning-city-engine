import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSpaceEventDto, UpdateSpaceEventDto } from './dto';
import { SpaceEvent } from 'src/database/entity/space-event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { SpaceEventStatus } from 'src/type';
import dayjs, { ManipulateType } from 'dayjs';

@Injectable()
export class SpaceEventService {
  constructor(
    @InjectRepository(SpaceEvent)
    private spaceEventRepository: Repository<SpaceEvent>,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    organizerId: string | null = null,
    spaceId: string | null = null,
    externalServiceId: string | null = null,
    permissionRequestId: string | null = null,
    statuses: SpaceEventStatus[] | null = null,
    topicIds: string[] | null = [],
    startsAfter: Date | null = null,
    name: string | null = null,
  ): Promise<{ data: SpaceEvent[]; total: number }> {
    const where = [];
    const params: any[] = [(page - 1) * limit, limit];
    let paramIndex: number = params.length;

    where.push(`is_active = true`);

    if (organizerId !== null) {
      paramIndex++;
      where.push(`organizer_id = $${paramIndex}`);
      params.push(organizerId);
    }

    if (spaceId !== null) {
      paramIndex++;
      where.push(`space_id = $${paramIndex}`);
      params.push(spaceId);
    }

    if (externalServiceId !== null) {
      paramIndex++;
      where.push(`external_service_id = $${paramIndex}`);
      params.push(externalServiceId);
    }

    if (permissionRequestId !== null) {
      paramIndex++;
      where.push(`permission_request_id = $${paramIndex}`);
      params.push(permissionRequestId);
    }

    if (statuses !== null) {
      paramIndex++;
      where.push(`status IN $${paramIndex}`);
      params.push(statuses);
    }

    if (topicIds !== null) {
      paramIndex++;
      where.push(
        `space_event.id IN (SELECT id FROM space_event_topic WHERE topic_id IN $${paramIndex})`,
      );
      params.push(topicIds);
    }

    if (startsAfter !== null) {
      paramIndex++;
      where.push(`starts_at >= $${paramIndex}`);
      params.push(startsAfter);
    }

    if (name !== null) {
      paramIndex++;
      where.push(`name LIKE $${paramIndex}`);
      params.push(`%${name}%`);
    }

    const query = `
      WITH filtered_data AS (
        SELECT (
          id,
          name,
          organizer_id,
          space_id,
          permission_request_id,
          external_service_id,
          status,
          details,
          is_active,
          link,
          duration,
          starts_at,
          ends_at,
          created_at,
          updated_at
        ) FROM space_event
        WHERE ${where.join(' AND ')}
      )
      SELECT COUNT(*) AS total, json_agg(filtered_data) AS data
      FROM filtered_data
      LIMIT $2 OFFSET $1;
    `;

    return await this.spaceEventRepository.query(query, params);
  }

  findOneById(id: string): Promise<SpaceEvent> {
    return this.spaceEventRepository.findOneBy({ id });
  }

  findOneByName(name: string): Promise<SpaceEvent> {
    return this.spaceEventRepository.findOneBy({ name });
  }

  async remove(id: string): Promise<void> {
    await this.spaceEventRepository.delete(id);
  }

  create(createSpaceEventDto: CreateSpaceEventDto): Promise<SpaceEvent> {
    const { duration, startsAt } = createSpaceEventDto;
    const start = dayjs(startsAt);
    const match = duration.match(/^(\d+)([dwMyhms]+)$/);
    const numberPart = parseInt(match[1], 10);
    const stringPart: ManipulateType = match[2] as ManipulateType;
    const testRegex = /^[dwMyhms]$/;

    if (Number.isInteger(numberPart) === false) {
      throw new BadRequestException();
    }

    if (testRegex.test(stringPart) === false) {
      throw new BadRequestException();
    }

    const rule = this.spaceEventRepository.create({
      endsAt: start.add(numberPart, stringPart).toDate(),
      ...createSpaceEventDto,
    });
    return this.spaceEventRepository.save(rule);
  }

  update(
    id: string,
    updateSpaceEventDto: UpdateSpaceEventDto,
  ): Promise<UpdateResult> {
    return this.spaceEventRepository.update(id, updateSpaceEventDto);
  }
}
