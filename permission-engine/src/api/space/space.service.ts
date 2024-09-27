import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Space } from '../../database/entity/space.entity';

@Injectable()
export class SpaceService {
  constructor(
    @InjectRepository(Space)
    private spaceRepository: Repository<Space>,
  ) {}

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

  create(spaceData: Partial<Space>): Promise<Space> {
    const space = this.spaceRepository.create(spaceData);
    return this.spaceRepository.save(space);
  }
}
