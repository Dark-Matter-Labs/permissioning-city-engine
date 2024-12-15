import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { CreateSpaceHistoryTaskImageDto } from './dto';
import { SpaceHistoryTaskImage } from 'src/database/entity/space-history-task-image.entity';

@Injectable()
export class SpaceHistoryTaskImageService {
  constructor(
    @InjectRepository(SpaceHistoryTaskImage)
    private spaceHistoryTaskImageRepository: Repository<SpaceHistoryTaskImage>,
  ) {}

  findAllBySpaceHistoryId(
    spaceHistoryId: string,
  ): Promise<SpaceHistoryTaskImage[]> {
    return this.spaceHistoryTaskImageRepository.findBy({ spaceHistoryId });
  }

  findOneById(id: string): Promise<SpaceHistoryTaskImage> {
    return this.spaceHistoryTaskImageRepository.findOneBy({ id });
  }

  async remove(id: string): Promise<void> {
    await this.spaceHistoryTaskImageRepository.delete(id);
  }

  async create(
    createSpaceHistoryImageDto: CreateSpaceHistoryTaskImageDto,
  ): Promise<SpaceHistoryTaskImage> {
    const spaceHistoryTaskImage = this.spaceHistoryTaskImageRepository.create({
      ...createSpaceHistoryImageDto,
      id: createSpaceHistoryImageDto.id ?? uuidv4(),
    });

    return this.spaceHistoryTaskImageRepository.save(spaceHistoryTaskImage);
  }
}
