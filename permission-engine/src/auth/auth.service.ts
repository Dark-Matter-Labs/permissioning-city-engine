import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/api/user/user.service';
import { User } from 'src/database/entity/user.entity';
import { RefreshTokenService } from './token/refresh-token.service';
import { CreateUserDto } from 'src/api/user/dto';
import { JwtPayloadDto } from './token/dto';
import { Logger } from 'src/lib/logger/logger.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly logger: Logger,
  ) {}

  async findOrCreateUser(profile: CreateUserDto): Promise<User> {
    let user = await this.userService.findOneByEmail(profile.email);
    if (!user) {
      user = await this.userService.create({
        email: profile.email,
        name: profile.name,
      });
    }
    return user;
  }

  async generateTokens(profile: any) {
    const payload: JwtPayloadDto = {
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      picture: profile.picture,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: `${process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME}s`,
    });

    const registeredUser = await this.findOrCreateUser({
      name: profile.firstName,
      email: profile.email,
    });
    const refreshToken = await this.generateRefreshToken(registeredUser);

    return { accessToken, refreshToken };
  }

  async generateRefreshToken(user: User) {
    const token = bcrypt.hashSync(
      user.id.toString() + Date.now().toString(),
      10,
    );

    const refreshToken = await this.refreshTokenService.create({
      token,
      user,
    });

    return refreshToken.token;
  }

  async refreshAccessToken(refreshToken: string) {
    const user = await this.refreshTokenService.getUserByToken(refreshToken);

    if (!user) {
      throw new Error('Invalid or expired refresh token');
    }
    const payload = {
      email: user.email,
      sub: user.id,
    };

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: `${process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME}s`,
    });
  }

  async revokeRefreshToken(refreshToken: string) {
    await this.refreshTokenService.remove(refreshToken);
  }
}
