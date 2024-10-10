import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository, UpdateResult } from 'typeorm';
import { Space } from '../../database/entity/space.entity';
import { CreateSpaceDto, UpdateSpaceDto } from './dto';
import { User } from 'src/database/entity/user.entity';
import { Rule } from 'src/database/entity/rule.entity';
import { SpacePermissioner } from 'src/database/entity/space-permissioner.entity';

@Injectable()
export class SpaceService {
  constructor(
    @InjectRepository(Space)
    private spaceRepository: Repository<Space>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Rule)
    private ruleRepository: Repository<Rule>,
    @InjectRepository(SpacePermissioner)
    private spacePermissionerRepository: Repository<SpacePermissioner>,
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

  findByRuleId(ruleId: string): Promise<Space[]> {
    return this.spaceRepository.findBy({ ruleId });
  }

  async remove(id: string): Promise<void> {
    await this.spaceRepository.delete(id);
  }

  create(ownerId: string, createSpaceDto: CreateSpaceDto): Promise<Space> {
    const space = this.spaceRepository.create({
      ...createSpaceDto,
      ownerId,
    });

    return this.spaceRepository.save(space);
  }

  async update(updateSpaceDto: UpdateSpaceDto): Promise<UpdateResult> {
    const { id, ruleId } = updateSpaceDto;

    if (ruleId != null) {
      const rule = await this.ruleRepository.findOneBy({ id: ruleId });

      if (!rule) {
        throw new BadRequestException(`There is no rule with id: ${ruleId}`);
      }

      const space = await this.spaceRepository.findOneBy({ id });
      const isPermissionerExists =
        await this.spacePermissionerRepository.existsBy({
          spaceId: id,
          isActive: true,
          userId: Not(space.ownerId),
        });

      if (isPermissionerExists === true) {
        throw new ForbiddenException('Cannot update rule whithout permission.');
      }
    }

    return this.spaceRepository.update(id, updateSpaceDto);
  }
}
