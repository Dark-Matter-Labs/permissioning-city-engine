import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { CreateSpacePermissionerDto, UpdateSpacePermissionerDto } from './dto';
import { SpacePermissioner } from 'src/database/entity/space-permissioner.entity';

@Injectable()
export class SpacePermissionerService {
  constructor(
    @InjectRepository(SpacePermissioner)
    private spacePermissionerRepository: Repository<SpacePermissioner>,
  ) {}

  findAll(): Promise<SpacePermissioner[]> {
    return this.spacePermissionerRepository.find();
  }

  findOneById(id: string): Promise<SpacePermissioner> {
    return this.spacePermissionerRepository.findOneBy({ id });
  }

  async findBySpaceId(findAllSpacePermissionerBySpaceIdDto: {
    spaceId: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: SpacePermissioner[]; total: number }> {
    const { spaceId } = findAllSpacePermissionerBySpaceIdDto;
    let { page, limit } = findAllSpacePermissionerBySpaceIdDto;

    if (!page) {
      page = 1;
    }

    if (!limit) {
      limit = 10;
    }

    const [data, total] = await this.spacePermissionerRepository.findAndCount({
      where: { spaceId },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: data ?? [],
      total,
    };
  }

  async remove(id: string): Promise<void> {
    await this.spacePermissionerRepository.delete(id);
  }

  create(
    createSpacePermissionerDto: CreateSpacePermissionerDto,
  ): Promise<SpacePermissioner> {
    const spacePermissioner = this.spacePermissionerRepository.create(
      createSpacePermissionerDto,
    );
    return this.spacePermissionerRepository.save(spacePermissioner);
  }

  async update(
    updateSpacePermissionerDto: UpdateSpacePermissionerDto,
  ): Promise<UpdateResult> {
    const { id, isActive } = updateSpacePermissionerDto;

    return this.spacePermissionerRepository.update(id, {
      isActive,
    });
  }
}
