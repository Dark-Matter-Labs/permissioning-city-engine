import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from '../../database/entity/refresh-token.entity';
import { v4 as uuidv4 } from 'uuid';
import { CreateRefreshTokenDto } from './dto';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  findOne(id: string): Promise<RefreshToken> {
    return this.refreshTokenRepository.findOneBy({ id });
  }

  findByToken(token: string): Promise<RefreshToken> {
    return this.refreshTokenRepository.findOneBy({ token });
  }

  async remove(token: string): Promise<void> {
    await this.refreshTokenRepository.delete({ token });
  }

  create(createUserDto: CreateRefreshTokenDto): Promise<RefreshToken> {
    const user = this.refreshTokenRepository.create({
      id: uuidv4(),
      ...createUserDto,
    });
    return this.refreshTokenRepository.save(user);
  }
}
