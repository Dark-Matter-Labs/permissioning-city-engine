import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateSpaceEventDto, UpdateSpaceEventDto } from './dto';
import { SpaceEvent } from 'src/database/entity/space-event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, UpdateResult } from 'typeorm';
import dayjs, { ManipulateType } from 'dayjs';
import { FindAllSpaceEventDto } from './dto/find-all-space-event.dto';
import { PermissionRequest } from 'src/database/entity/permission-request.entity';
import { PermissionRequestStatus } from 'src/lib/type';

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

    return {
      data: !data ? [] : data,
      total: parseInt(total),
    };
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

  create(
    organizerId: string,
    createSpaceEventDto: CreateSpaceEventDto,
  ): Promise<SpaceEvent> {
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

    const spaceEvent = this.spaceEventRepository.create({
      ...createSpaceEventDto,
      organizerId,
      endsAt: start.add(numberPart, stringPart).toDate(),
    });
    return this.spaceEventRepository.save(spaceEvent);
  }

  async update(
    id: string,
    updateSpaceEventDto: UpdateSpaceEventDto,
  ): Promise<UpdateResult> {
    const isOngoingPermissionRequest =
      await this.permissionRequestRepository.existsBy({
        spaceEventId: id,
        status: In([
          PermissionRequestStatus.pending,
          PermissionRequestStatus.assigned,
          PermissionRequestStatus.assignFailed,
          PermissionRequestStatus.issueRaised,
          PermissionRequestStatus.reviewApproved,
          PermissionRequestStatus.reviewApprovedWithCondition,
        ]),
      });

    if (isOngoingPermissionRequest === true) {
      throw new ForbiddenException(
        'Cannot update when there is ongoing permission request.',
      );
    }

    return this.spaceEventRepository.update(id, updateSpaceEventDto);
  }
}
