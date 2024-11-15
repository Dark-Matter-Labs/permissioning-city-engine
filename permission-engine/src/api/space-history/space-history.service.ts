import { Injectable } from '@nestjs/common';
import { CreateSpaceHistoryDto, FindAllSpaceHistoryDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsWhere, In, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { SpaceHistory } from 'src/database/entity/space-history.entity';

@Injectable()
export class SpaceHistoryService {
  constructor(
    @InjectRepository(SpaceHistory)
    private spaceHistoryRepository: Repository<SpaceHistory>,
  ) {}

  async findAll(
    findAllSpaceHistoryDto: FindAllSpaceHistoryDto,
    option: { isPagination: boolean } = { isPagination: true },
  ): Promise<{ data: SpaceHistory[]; total: number }> {
    const { page, limit, spaceId, isPublic, types } = findAllSpaceHistoryDto;
    const { isPagination } = option;
    const where: FindOptionsWhere<SpaceHistory> = {};

    if (spaceId != null) {
      where.spaceId = spaceId;
    }

    if (types != null) {
      where.type = In(types);
    }

    if (isPublic != null) {
      where.isPublic = isPublic;
    } else {
      where.isPublic = true;
    }

    let queryOption: FindManyOptions<SpaceHistory> = {
      where,
      relations: [
        'space',
        'rule',
        'logger',
        'spacePermissioner',
        'spaceEvent',
        'permissionRequest',
      ],
    };
    if (isPagination === true) {
      queryOption = {
        ...queryOption,
        skip: (page - 1) * limit,
        take: limit,
      };
    }

    const [data, total] =
      await this.spaceHistoryRepository.findAndCount(queryOption);

    return {
      data: data ?? [],
      total,
    };
  }

  findOneById(id: string): Promise<SpaceHistory> {
    return this.spaceHistoryRepository.findOneBy({ id });
  }

  create(createSpaceHistoryDto: CreateSpaceHistoryDto): Promise<SpaceHistory> {
    const spaceHistory = this.spaceHistoryRepository.create({
      ...createSpaceHistoryDto,
      id: uuidv4(),
    });

    return this.spaceHistoryRepository.save(spaceHistory);
  }
}
