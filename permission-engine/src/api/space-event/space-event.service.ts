import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateSpaceEventDto, UpdateSpaceEventDto } from './dto';
import { SpaceEvent } from 'src/database/entity/space-event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import dayjs from 'dayjs';
import { FindAllSpaceEventDto } from './dto/find-all-space-event.dto';
import { PermissionRequest } from 'src/database/entity/permission-request.entity';
import { SpaceEventStatus } from 'src/lib/type';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SpaceEventService {
  constructor(
    @InjectRepository(SpaceEvent)
    private spaceEventRepository: Repository<SpaceEvent>,
    @InjectRepository(PermissionRequest)
    private permissionRequestRepository: Repository<PermissionRequest>,
  ) {}

  async findAll(
    findAllSpaceEventDto: FindAllSpaceEventDto,
  ): Promise<{ data: SpaceEvent[]; total: number }> {
    const {
      page,
      limit,
      organizerId,
      spaceId,
      externalServiceId,
      permissionRequestId,
      statuses,
      topicIds,
      startsAfter,
      name,
    } = findAllSpaceEventDto;

    const where = [];
    const params: any[] = [(page - 1) * limit, limit];
    let paramIndex: number = params.length;

    where.push(`is_active = true`);

    if (organizerId != null) {
      paramIndex++;
      where.push(`organizer_id = $${paramIndex}`);
      params.push(organizerId);
    }

    if (spaceId != null) {
      paramIndex++;
      where.push(`space_id = $${paramIndex}`);
      params.push(spaceId);
    }

    if (externalServiceId != null) {
      paramIndex++;
      where.push(`external_service_id = $${paramIndex}`);
      params.push(externalServiceId);
    }

    if (permissionRequestId != null) {
      paramIndex++;
      where.push(`permission_request_id = $${paramIndex}`);
      params.push(permissionRequestId);
    }

    if (statuses != null) {
      paramIndex++;
      where.push(`status IN $${paramIndex}`);
      params.push(statuses);
    }

    if (topicIds != null) {
      paramIndex++;
      where.push(
        `space_event.id IN (SELECT id FROM space_event_topic WHERE topic_id IN $${paramIndex})`,
      );
      params.push(topicIds);
    }

    if (startsAfter != null) {
      paramIndex++;
      where.push(`starts_at >= $${paramIndex}`);
      params.push(startsAfter);
    }

    if (name != null) {
      paramIndex++;
      where.push(`name LIKE $${paramIndex}`);
      params.push(`%${name}%`);
    }

    const whereClause = where.length > 0 ? 'WHERE' : '';
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
        ${whereClause} ${where.join(' AND ')}
      )
      SELECT COUNT(*) AS total, json_agg(filtered_data) AS data
      FROM filtered_data
      LIMIT $2 OFFSET $1;
    `;

    const [{ data, total }] = await this.spaceEventRepository.query(
      query,
      params,
    );

    let result = [];

    if (data != null) {
      result = data.map((item) => {
        return {
          id: item.row.f1,
          name: item.row.f2,
          organizerId: item.row.f3,
          spaceId: item.row.f4,
          permissionRequestId: item.row.f5,
          externalServiceId: item.row.f6,
          status: item.row.f7,
          details: item.row.f8,
          isActive: item.row.f9,
          link: item.row.f10,
          duration: item.row.f11,
          startsAt: item.row.f12,
          endsAt: item.row.f13,
          createdAt: item.row.f14,
          updatedAt: item.row.f15,
        };
      });
    }

    return {
      data: result,
      total: parseInt(total),
    };
  }

  findOneById(id: string): Promise<SpaceEvent> {
    return this.spaceEventRepository.findOne({
      where: { id },
      relations: ['spaceEventImages'],
    });
  }

  findOneByName(name: string): Promise<SpaceEvent> {
    return this.spaceEventRepository.findOne({
      where: { name },
      relations: ['spaceEventImages'],
    });
  }

  async remove(id: string): Promise<void> {
    await this.spaceEventRepository.delete(id);
  }

  create(
    organizerId: string,
    createSpaceEventDto: CreateSpaceEventDto,
  ): Promise<SpaceEvent> {
    const { duration, startsAt } = createSpaceEventDto;
    const start = dayjs(new Date(startsAt));
    const match = duration.match(/^(\d+)([dwMyhms]+)$/);
    const numberPart = parseInt(match[1], 10);
    const stringPart: dayjs.ManipulateType = match[2] as dayjs.ManipulateType;
    const testRegex = /^[dwMyhms]$/;

    if (Number.isInteger(numberPart) === false) {
      throw new BadRequestException(
        'duration must match format: n{d|w|M|y|h|m|s}',
      );
    }

    if (testRegex.test(stringPart) === false) {
      throw new BadRequestException(
        'duration must match format: n{d|w|M|y|h|m|s}',
      );
    }

    const spaceEvent = this.spaceEventRepository.create({
      ...createSpaceEventDto,
      id: uuidv4(),
      organizerId,
      endsAt: start.add(numberPart, stringPart).toDate(),
    });

    return this.spaceEventRepository.save(spaceEvent);
  }

  async update(
    id: string,
    updateSpaceEventDto: UpdateSpaceEventDto,
  ): Promise<UpdateResult> {
    const spaceEvent = await this.spaceEventRepository.findOneBy({ id });

    if (spaceEvent.status !== SpaceEventStatus.pending) {
      // TODO. allow update spaceEvent after permission granted?
      throw new ForbiddenException('Cannot update after pending state.');
    }

    return this.spaceEventRepository.update(id, updateSpaceEventDto);
  }

  async run(id: string): Promise<UpdateResult> {
    const spaceEvent = await this.spaceEventRepository.findOneBy({ id });

    if (
      [SpaceEventStatus.permissionGranted].includes(spaceEvent.status) === false
    ) {
      throw new ForbiddenException(
        `Cannot run ${spaceEvent.status} SpaceEvent.`,
      );
    }

    const start = dayjs(new Date(spaceEvent.startsAt));
    if (start > dayjs().add(10, 'm')) {
      throw new ForbiddenException(
        'Can start from 10 minutes before SpaceEvent.startsAt.',
      );
    }

    return this.spaceEventRepository.update(id, {
      status: SpaceEventStatus.complete,
    });
  }

  async complete(id: string): Promise<UpdateResult> {
    const spaceEvent = await this.spaceEventRepository.findOneBy({ id });

    if (
      [
        SpaceEventStatus.permissionGranted,
        SpaceEventStatus.running,
        SpaceEventStatus.closed,
      ].includes(spaceEvent.status) === false
    ) {
      throw new ForbiddenException(
        `Cannot complete ${spaceEvent.status} SpaceEvent.`,
      );
    }

    const start = dayjs(new Date(spaceEvent.startsAt));
    if (start > dayjs()) {
      throw new ForbiddenException('Can complete after SpaceEvent starts.');
    }

    // check space rule blocks with `space:post_event_check`

    return this.spaceEventRepository.update(id, {
      status: SpaceEventStatus.complete,
    });
  }
}
