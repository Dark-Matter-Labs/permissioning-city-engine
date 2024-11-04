import { Injectable } from '@nestjs/common';
import { CreateSpaceTopicDto, RemoveSpaceTopicDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { SpaceTopic } from 'src/database/entity/space-topic.entity';

@Injectable()
export class SpaceTopicService {
  constructor(
    @InjectRepository(SpaceTopic)
    private spaceTopicRepository: Repository<SpaceTopic>,
  ) {}

  findAllBySpaceId(spaceId: string): Promise<SpaceTopic[]> {
    return this.spaceTopicRepository.findBy({ spaceId });
  }

  findAllByTopicId(topicId: string): Promise<SpaceTopic[]> {
    return this.spaceTopicRepository.findBy({ topicId });
  }

  async remove(
    removeSpaceTopicDto: RemoveSpaceTopicDto,
  ): Promise<DeleteResult> {
    return await this.spaceTopicRepository.delete({
      space: { id: removeSpaceTopicDto.spaceId },
      topic: { id: removeSpaceTopicDto.topicId },
    });
  }

  create(createSpaceTopicDto: CreateSpaceTopicDto): Promise<SpaceTopic> {
    const spaceTopic = this.spaceTopicRepository.create(createSpaceTopicDto);

    return this.spaceTopicRepository.save(spaceTopic);
  }
}
