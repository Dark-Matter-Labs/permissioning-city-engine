import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRefreshTokenDto } from './dto';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/database/entity/user.entity';
import { Logger } from 'src/lib/logger/logger.service';

@Injectable()
export class RefreshTokenService {
  private readonly redis: Redis | null;
  private readonly prefix = 'refresh_token';

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {
    try {
      this.redis = this.redisService.getOrThrow();
    } catch (error) {
      this.logger.error('Failed to load redis', error);
    }
  }

  async getUserByToken(token: string): Promise<User> {
    const key = `${this.prefix}:${token}`;
    const userByRefreshToken: string | null = await this.redis.get(key);

    if (!userByRefreshToken) {
      throw new BadRequestException(`token does not exist: ${token}`);
    }

    const user: User = JSON.parse(userByRefreshToken);

    return user;
  }

  async remove(token: string): Promise<void> {
    await this.redis.del(`${this.prefix}:${token}`);
  }

  async create(
    createRefreshTokenDto: CreateRefreshTokenDto,
  ): Promise<{ token: string; user: User }> {
    const { token, user } = createRefreshTokenDto;
    const key = `${this.prefix}:${token}`;

    await this.redis.set(
      key,
      JSON.stringify(user),
      'EX',
      this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
    );

    return { token, user: JSON.parse(await this.redis.get(key)) };
  }
}
