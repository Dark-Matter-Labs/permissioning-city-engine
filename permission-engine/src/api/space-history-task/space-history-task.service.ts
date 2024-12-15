import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SpaceHistoryTask } from 'src/database/entity/space-history-task.entity';
import { Repository } from 'typeorm';
import { CreateSpaceHistoryTaskDto, UpdateSpaceHistoryTaskDto } from './dto';
import { SpaceHistoryTaskStatus } from 'src/lib/type';

@Injectable()
export class SpaceHistoryTaskService {
  constructor(
    @InjectRepository(SpaceHistoryTask)
    private spaceHistoryTaskRepository: Repository<SpaceHistoryTask>,
  ) {}

  findAllBySpaceHistoryId(spaceHistoryId: string): Promise<SpaceHistoryTask[]> {
    return this.spaceHistoryTaskRepository.find({
      where: { spaceHistoryId },
      order: { createdAt: 'DESC' },
    });
  }

  findOneById(id: string): Promise<SpaceHistoryTask> {
    return this.spaceHistoryTaskRepository.findOneBy({ id });
  }

  async remove(id: string): Promise<void> {
    await this.spaceHistoryTaskRepository.delete(id);
  }

  async create(
    createSpaceHistoryTaskDto: CreateSpaceHistoryTaskDto,
  ): Promise<SpaceHistoryTask> {
    const spaceHistoryTask = this.spaceHistoryTaskRepository.create({
      ...createSpaceHistoryTaskDto,
      status: SpaceHistoryTaskStatus.pending,
    });

    return this.spaceHistoryTaskRepository.save(spaceHistoryTask);
  }

  async update(
    id: string,
    updateSpaceHistoryTaskDto: UpdateSpaceHistoryTaskDto,
  ): Promise<{ data: { result: boolean } }> {
    const updateResult = await this.spaceHistoryTaskRepository.update(id, {
      ...updateSpaceHistoryTaskDto,
      status: SpaceHistoryTaskStatus.resolved,
      updatedAt: new Date(),
    });

    return {
      data: {
        result: updateResult.affected === 1,
      },
    };
  }
}
