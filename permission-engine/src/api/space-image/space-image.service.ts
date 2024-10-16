import { Injectable } from '@nestjs/common';
import { CreateSpaceImageDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { SpaceImage } from 'src/database/entity/space-image.entity';

@Injectable()
export class SpaceImageService {
  constructor(
    @InjectRepository(SpaceImage)
    private spaceImageRepository: Repository<SpaceImage>,
  ) {}

  findAllBySpaceId(spaceId: string): Promise<SpaceImage[]> {
    return this.spaceImageRepository.findBy({ spaceId });
  }

  findOneById(id: string): Promise<SpaceImage> {
    return this.spaceImageRepository.findOneBy({ id });
  }

  async remove(id: string): Promise<void> {
    await this.spaceImageRepository.delete(id);
  }

  create(createSpaceImageDto: CreateSpaceImageDto): Promise<SpaceImage> {
    const spaceImage = this.spaceImageRepository.create({
      ...createSpaceImageDto,
      id: createSpaceImageDto.id ?? uuidv4(),
    });

    return this.spaceImageRepository.save(spaceImage);
  }
}
