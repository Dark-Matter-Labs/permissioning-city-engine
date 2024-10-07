import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { Space } from '../../database/entity/space.entity';
import { CreateSpaceDto, UpdateSpaceDto } from './dto';

@Injectable()
export class SpaceService {
  constructor(
    @InjectRepository(Space)
    private spaceRepository: Repository<Space>,
  ) {}

  // TODO. implement dynamic search in the future
  findAll(): Promise<Space[]> {
    return this.spaceRepository.find();
  }

  findOneById(id: string): Promise<Space> {
    return this.spaceRepository.findOneBy({ id });
  }

  findOneByName(name: string): Promise<Space> {
    return this.spaceRepository.findOneBy({ name });
  }

  async remove(id: string): Promise<void> {
    await this.spaceRepository.delete(id);
  }

  create(createSpaceDto: CreateSpaceDto): Promise<Space> {
    const space = this.spaceRepository.create(createSpaceDto);
    return this.spaceRepository.save(space);
  }

  update(id: string, updateSpaceDto: UpdateSpaceDto): Promise<UpdateResult> {
    return this.spaceRepository.update(id, updateSpaceDto);
  }
}
