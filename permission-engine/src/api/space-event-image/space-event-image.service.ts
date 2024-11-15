import { Injectable } from '@nestjs/common';
import { CreateSpaceEventImageDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { SpaceEventImage } from 'src/database/entity/space-event-image.entity';
import { SpaceEventImageType } from 'src/lib/type';

@Injectable()
export class SpaceEventImageService {
  constructor(
    @InjectRepository(SpaceEventImage)
    private spaceEventImageRepository: Repository<SpaceEventImage>,
  ) {}

  findAllBySpaceEventId(spaceEventId: string): Promise<SpaceEventImage[]> {
    return this.spaceEventImageRepository.findBy({ spaceEventId });
  }

  findOneById(id: string): Promise<SpaceEventImage> {
    return this.spaceEventImageRepository.findOneBy({ id });
  }

  async remove(id: string): Promise<void> {
    await this.spaceEventImageRepository.delete(id);
  }

  async create(
    createSpaceEventImageDto: CreateSpaceEventImageDto,
  ): Promise<SpaceEventImage> {
    const { spaceEventId, type } = createSpaceEventImageDto;
    if (type !== SpaceEventImageType.list) {
      const existingImage = await this.spaceEventImageRepository.findOneBy({
        spaceEventId,
        type,
      });

      // replace if exists
      if (existingImage) {
        await this.remove(existingImage.id);
      }
    }

    const spaceEventImage = this.spaceEventImageRepository.create({
      ...createSpaceEventImageDto,
      id: createSpaceEventImageDto.id ?? uuidv4(),
    });

    return this.spaceEventImageRepository.save(spaceEventImage);
  }
}
