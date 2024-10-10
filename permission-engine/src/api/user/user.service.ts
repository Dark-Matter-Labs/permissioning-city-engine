import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { User } from '../../database/entity/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto';
import { v4 as uuidv4 } from 'uuid'; // Importing the UUID v4 version

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  findOne(id: string): Promise<User> {
    return this.userRepository.findOneBy({ id });
  }

  findOneByEmail(email: string): Promise<User> {
    return this.userRepository.findOneBy({ email });
  }

  async remove(email: string): Promise<void> {
    await this.userRepository.delete({ email });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create({
      id: uuidv4(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...createUserDto,
    });
    return await this.userRepository.save(user);
  }

  async update(
    email: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UpdateResult> {
    const user = await this.findOneByEmail(email);

    return this.userRepository.update(user.id, {
      updatedAt: new Date(),
      ...updateUserDto,
    });
  }
}
