import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import {
  CompleteSpaceEventDto,
  CreateSpaceEventDto,
  UpdateSpaceEventDto,
} from './dto';
import { SpaceEvent } from 'src/database/entity/space-event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import dayjs from 'dayjs';
import { FindAllSpaceEventDto } from './dto/find-all-space-event.dto';
import { SpaceEventStatus } from 'src/lib/type';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SpaceEventService {
  constructor(
    @InjectRepository(SpaceEvent)
    private spaceEventRepository: Repository<SpaceEvent>,
  ) {}

  async findAll(
    findAllSpaceEventDto: FindAllSpaceEventDto,
    isPagination: boolean = true,
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
      endsBefore,
      name,
    } = findAllSpaceEventDto;

    const where = [];
    const params: any[] =
      isPagination === true ? [(page - 1) * limit, limit] : [];
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
      where.push(`status = ANY($${paramIndex})`);
      params.push(statuses);
    }

    if (topicIds != null) {
      paramIndex++;
      where.push(
        `space_event.id IN (SELECT space_event_id FROM space_event_topic WHERE topic_id = ANY($${paramIndex}))`,
      );
      params.push(topicIds);
    }

    if (startsAfter != null) {
      paramIndex++;
      where.push(`starts_at >= $${paramIndex}`);
      params.push(startsAfter);
    }

    if (endsBefore != null) {
      paramIndex++;
      where.push(`ends_at <= $${paramIndex}`);
      params.push(endsBefore);
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
          space_event.id,
          space_event.name,
          space_event.organizer_id,
          space_event.space_id,
          space_event.rule_id,
          space_event.permission_request_id,
          space_event.external_service_id,
          space_event.status,
          space_event.details,
          space_event.is_active,
          space_event.link,
          space_event.callback_link,
          space_event.duration,
          space_event.starts_at,
          space_event.ends_at,
          space_event.created_at,
          space_event.updated_at,
          ARRAY_AGG(space_event_image)
        ) FROM space_event
        LEFT JOIN space_event_image
        ON space_event.id = space_event_image.space_event_id
        ${whereClause} ${where.join(' AND ')}
        GROUP BY space_event.id
      )
      SELECT COUNT(*) AS total, json_agg(filtered_data) AS data
      FROM filtered_data
      ${isPagination === true ? 'LIMIT $2 OFFSET $1' : ''};
    `;

    const [{ data, total }] = await this.spaceEventRepository.query(
      query,
      params,
    );

    let result = [];

    if (data != null) {
      result = data.map((item) => {
        const spaceEventImages = item.row.f18;
        return {
          id: item.row.f1,
          name: item.row.f2,
          organizerId: item.row.f3,
          spaceId: item.row.f4,
          ruleId: item.row.f5,
          permissionRequestId: item.row.f6,
          externalServiceId: item.row.f7,
          status: item.row.f8,
          details: item.row.f9,
          isActive: item.row.f10,
          link: item.row.f11,
          callbackLink: item.row.f12,
          duration: item.row.f13,
          startsAt: item.row.f14,
          endsAt: item.row.f15,
          createdAt: item.row.f16,
          updatedAt: item.row.f17,
          spaceEventImages:
            spaceEventImages[0] === null ? [] : spaceEventImages,
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
  ): Promise<{ data: { result: boolean } }> {
    const spaceEvent = await this.spaceEventRepository.findOneBy({ id });

    if (spaceEvent.status !== SpaceEventStatus.pending) {
      throw new ForbiddenException('Cannot update after pending state.');
    }

    let { duration, startsAt } = updateSpaceEventDto;

    if (startsAt == null) {
      startsAt = spaceEvent.startsAt;
    }

    if (duration == null) {
      duration = spaceEvent.duration;
    }

    const start = dayjs(new Date(startsAt));
    const match = duration.match(/^(\d+)([dwMyhms]+)$/);
    const numberPart = parseInt(match[1], 10);
    const stringPart: dayjs.ManipulateType = match[2] as dayjs.ManipulateType;

    const updateResult = await this.spaceEventRepository.update(id, {
      ...updateSpaceEventDto,
      endsAt: start.add(numberPart, stringPart).toDate(),
      updatedAt: new Date(),
    });

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }

  async updateToPermissionRequested(
    id: string,
  ): Promise<{ data: { result: boolean } }> {
    const spaceEvent = await this.spaceEventRepository.findOneBy({ id });

    if ([SpaceEventStatus.pending].includes(spaceEvent.status) === false) {
      throw new ForbiddenException(
        `Cannot request permission for ${spaceEvent.status} SpaceEvent.`,
      );
    }

    const updateResult = await this.spaceEventRepository.update(id, {
      status: SpaceEventStatus.permissionRequested,
      updatedAt: new Date(),
    });

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }

  async updateToPermissionGranted(
    id: string,
  ): Promise<{ data: { result: boolean } }> {
    const spaceEvent = await this.spaceEventRepository.findOneBy({ id });

    if (
      [SpaceEventStatus.permissionRequested].includes(spaceEvent.status) ===
      false
    ) {
      throw new ForbiddenException(
        `Cannot grant permission for ${spaceEvent.status} SpaceEvent.`,
      );
    }

    const updateResult = await this.spaceEventRepository.update(id, {
      status: SpaceEventStatus.permissionGranted,
      updatedAt: new Date(),
    });

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }

  async updateToPermissionRejected(
    id: string,
  ): Promise<{ data: { result: boolean } }> {
    const spaceEvent = await this.spaceEventRepository.findOneBy({ id });

    if (
      [SpaceEventStatus.permissionRequested].includes(spaceEvent.status) ===
      false
    ) {
      throw new ForbiddenException(
        `Cannot reject permission for ${spaceEvent.status} SpaceEvent.`,
      );
    }

    const updateResult = await this.spaceEventRepository.update(id, {
      status: SpaceEventStatus.permissionRejected,
      updatedAt: new Date(),
    });

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }

  async updateToCancelled(id: string): Promise<{ data: { result: boolean } }> {
    const spaceEvent = await this.spaceEventRepository.findOneBy({ id });

    if (
      [
        SpaceEventStatus.pending,
        SpaceEventStatus.permissionRequested,
        SpaceEventStatus.permissionGranted,
      ].includes(spaceEvent.status) === false
    ) {
      throw new ForbiddenException(
        `Cannot cancel ${spaceEvent.status} SpaceEvent.`,
      );
    }

    const updateResult = await this.spaceEventRepository.update(id, {
      status: SpaceEventStatus.cancelled,
      updatedAt: new Date(),
    });

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }

  async updateToRunning(id: string): Promise<{ data: { result: boolean } }> {
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

    const updateResult = await this.spaceEventRepository.update(id, {
      status: SpaceEventStatus.running,
      updatedAt: new Date(),
    });

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }

  async updateToClosed(id: string): Promise<{ data: { result: boolean } }> {
    const spaceEvent = await this.spaceEventRepository.findOneBy({ id });

    if ([SpaceEventStatus.running].includes(spaceEvent.status) === false) {
      throw new ForbiddenException(
        `Cannot close ${spaceEvent.status} SpaceEvent.`,
      );
    }

    const updateResult = await this.spaceEventRepository.update(id, {
      status: SpaceEventStatus.closed,
      updatedAt: new Date(),
    });

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }

  async updateToComplete(
    id: string,
    completeSpaceEventDto: CompleteSpaceEventDto,
  ): Promise<{ data: { result: boolean } }> {
    const spaceEvent = await this.spaceEventRepository.findOneBy({ id });
    const dto: Partial<SpaceEvent> = {
      status: SpaceEventStatus.complete,
      updatedAt: new Date(),
    };

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

    if (completeSpaceEventDto.details != null) {
      dto.details = completeSpaceEventDto.details;
      dto.status = SpaceEventStatus.completeWithIssue;
    }

    const updateResult = await this.spaceEventRepository.update(id, dto);

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }
}
