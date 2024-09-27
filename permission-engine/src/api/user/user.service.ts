import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entity/user.entity';
import { CreateUserDto } from './dto';
import { v4 as uuidv4 } from 'uuid'; // Importing the UUID v4 version

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: User[]; total: number }> {
    const [data, total] = await this.userRepository.findAndCount({
      where: { isActive: true },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  findOne(id: string): Promise<User> {
    return this.userRepository.findOneBy({ id });
  }

  findByEmail(email: string): Promise<User> {
    return this.userRepository.findOneBy({ email });
  }

  async remove(email: string): Promise<void> {
    await this.userRepository.delete({ email });
  }

  create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create({
      id: uuidv4(),
      ...createUserDto,
    });
    return this.userRepository.save(user);
  }
}
