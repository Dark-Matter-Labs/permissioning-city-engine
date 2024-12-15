import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { CreateSpaceHistoryImageDto } from './dto';
import { SpaceHistoryImage } from 'src/database/entity/space-history-image.entity';

@Injectable()
export class SpaceHistoryImageService {
  constructor(
    @InjectRepository(SpaceHistoryImage)
    private spaceHistoryImageRepository: Repository<SpaceHistoryImage>,
  ) {}

  findAllBySpaceHistoryId(
    spaceHistoryId: string,
  ): Promise<SpaceHistoryImage[]> {
    return this.spaceHistoryImageRepository.findBy({ spaceHistoryId });
  }

  findOneById(id: string): Promise<SpaceHistoryImage> {
    return this.spaceHistoryImageRepository.findOneBy({ id });
  }

  async remove(id: string): Promise<void> {
    await this.spaceHistoryImageRepository.delete(id);
  }

  async create(
    createSpaceHistoryImageDto: CreateSpaceHistoryImageDto,
  ): Promise<SpaceHistoryImage> {
    const spaceHistoryImage = this.spaceHistoryImageRepository.create({
      ...createSpaceHistoryImageDto,
      id: createSpaceHistoryImageDto.id ?? uuidv4(),
    });

    return this.spaceHistoryImageRepository.save(spaceHistoryImage);
  }
}
