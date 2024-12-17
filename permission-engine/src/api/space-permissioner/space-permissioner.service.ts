import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import {
  CreateSpacePermissionerDto,
  FindAllSpacePermissionerBySpaceIdDto,
  FindAllSpacePermissionerByUserIdDto,
  UpdateSpacePermissionerDto,
} from './dto';
import { SpacePermissioner } from 'src/database/entity/space-permissioner.entity';
import { v4 as uuidv4 } from 'uuid';

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

  findOneByUserIdAndSpaceId(
    userId: string,
    spaceId: string,
  ): Promise<SpacePermissioner> {
    return this.spacePermissionerRepository.findOneBy({ userId, spaceId });
  }

  async findAllBySpaceId(
    spaceId: string,
    findAllSpacePermissionerBySpaceIdDto: FindAllSpacePermissionerBySpaceIdDto,
    option: { isPagination: boolean } = { isPagination: true },
  ): Promise<{ data: SpacePermissioner[]; total: number }> {
    const { page, limit, isActive } = findAllSpacePermissionerBySpaceIdDto;
    const { isPagination } = option;
    let queryOption: FindManyOptions<SpacePermissioner> = {
      where: { spaceId, isActive },
    };

    if (isPagination === true) {
      queryOption = {
        ...queryOption,
        skip: (page - 1) * limit,
        take: limit,
      };
    }

    const [data, total] =
      await this.spacePermissionerRepository.findAndCount(queryOption);

    return {
      data: data ?? [],
      total: Number(total),
    };
  }

  async findAllByUserId(
    userId: string,
    findAllSpacePermissionerByUserIdDto: FindAllSpacePermissionerByUserIdDto,
    option: { isPagination: boolean } = { isPagination: true },
  ): Promise<{ data: SpacePermissioner[]; total: number }> {
    const { page, limit, isActive, spaceId } =
      findAllSpacePermissionerByUserIdDto;
    const { isPagination } = option;
    let queryOption: FindManyOptions<SpacePermissioner> = {
      where: { userId, isActive, spaceId },
    };

    if (isPagination === true) {
      queryOption = {
        ...queryOption,
        skip: (page - 1) * limit,
        take: limit,
      };
    }

    const [data, total] =
      await this.spacePermissionerRepository.findAndCount(queryOption);

    return {
      data: data ?? [],
      total: Number(total),
    };
  }

  async isSpacePermissioner(spaceId: string, userId: string): Promise<boolean> {
    return await this.spacePermissionerRepository.existsBy({
      spaceId,
      userId,
      isActive: true,
    });
  }

  async remove(id: string): Promise<void> {
    await this.spacePermissionerRepository.delete(id);
  }

  create(
    createSpacePermissionerDto: Partial<CreateSpacePermissionerDto>,
    option: { isActive: boolean } = { isActive: false },
  ): Promise<SpacePermissioner> {
    const { isActive } = option;
    const spacePermissioner = this.spacePermissionerRepository.create({
      ...createSpacePermissionerDto,
      id: uuidv4(),
      isActive,
    });

    return this.spacePermissionerRepository.save(spacePermissioner);
  }

  async update(
    updateSpacePermissionerDto: UpdateSpacePermissionerDto,
  ): Promise<{ data: { result: boolean } }> {
    const { id, isActive } = updateSpacePermissionerDto;

    const updateResult = await this.spacePermissionerRepository.update(id, {
      isActive,
      updatedAt: new Date(),
    });

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }
}
