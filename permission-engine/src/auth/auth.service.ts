import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/api/user/user.service';
import { User } from 'src/database/entity/user.entity';
import { RefreshTokenService } from './token/refresh-token.service';
import { CreateUserDto } from 'src/api/user/dto';
import { JwtPayloadDto } from './token/dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async googleLogin(req) {
    if (!req.user) {
      return 'No user from Google';
    }

    const user = req.user;

    // Generate JWT
    const payload: JwtPayloadDto = {
      email: user.email,
      sub: user.name,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRATION_TIME,
    });

    return {
      message: 'User information from Google',
      user: req.user,
      accessToken,
      refreshToken: user.refreshToken,
    };
  }

  async findOrCreateUser(profile: CreateUserDto): Promise<User> {
    let user = await this.userService.findByEmail(profile.email);
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
      sub: profile.firstName,
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
    const expiresAt = new Date(
      Date.now() +
        parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME) * 1000,
    );

    const refreshToken = await this.refreshTokenService.create({
      token: bcrypt.hashSync(token, 10),
      user,
      expiresAt,
    });

    return refreshToken.token;
  }

  async refreshAccessToken(refreshToken: string) {
    const storedRefreshToken = await this.refreshTokenService.findByToken(
      bcrypt.hashSync(refreshToken, 10),
    );

    if (!storedRefreshToken || storedRefreshToken.expiresAt < new Date()) {
      throw new Error('Invalid or expired refresh token');
    }

    const payload = {
      email: storedRefreshToken.user.email,
      sub: storedRefreshToken.user.id,
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
