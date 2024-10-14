import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import {
  CreateSpacePermissionerDto,
  FindAllSpacePermissionerByUserIdDto,
  UpdateSpacePermissionerDto,
} from './dto';
import { SpacePermissioner } from 'src/database/entity/space-permissioner.entity';
import { PaginationDto } from 'src/lib/dto';
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

  async findBySpaceId(
    spaceId: string,
    paginationDto: PaginationDto,
  ): Promise<{ data: SpacePermissioner[]; total: number }> {
    const { page, limit } = paginationDto;

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

  async findAllByUserId(
    userId: string,
    findAllSpacePermissionerByUserIdDto: FindAllSpacePermissionerByUserIdDto,
  ): Promise<{ data: SpacePermissioner[]; total: number }> {
    const { page, limit, isActive } = findAllSpacePermissionerByUserIdDto;

    const [data, total] = await this.spacePermissionerRepository.findAndCount({
      where: { userId, isActive },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: data ?? [],
      total,
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
    isActive: boolean = false,
  ): Promise<SpacePermissioner> {
    const spacePermissioner = this.spacePermissionerRepository.create({
      ...createSpacePermissionerDto,
      id: uuidv4(),
      isActive,
    });

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
