import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/api/user/user.service';
import { User } from 'src/database/entity/user.entity';
import { RefreshTokenService } from './token/refresh-token.service';
import { CreateUserDto } from 'src/api/user/dto';
import { JwtPayloadDto } from './token/dto';
import { Logger } from 'src/lib/logger/logger.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {}

  async findOrCreateUser(
    createUserDto: CreateUserDto,
    ipAddress?: string,
  ): Promise<User> {
    let user = await this.userService.findOneByEmail(createUserDto.email);

    // TODO. remove dev code after test
    if (process.env.NODE_ENV === 'dev') {
      try {
        const ipLocationProvider = this.configService.get<string>(
          'IP_LOCATION_PROVIDER',
        );
        const ipLocationInfo = await axios
          .get(`${ipLocationProvider}/json/${ipAddress}`)
          .then((res) => res.data);
        this.logger.log('ip location info', ipLocationInfo);
      } catch (error) {
        this.logger.error('Failed to get location info from request ip', error);
      }
    }

    if (!user) {
      if (typeof ipAddress === 'string') {
        try {
          const ipLocationProvider = this.configService.get<string>(
            'IP_LOCATION_PROVIDER',
          );
          const ipLocationInfo = await axios
            .get(`${ipLocationProvider}/json/${ipAddress}`)
            .then((res) => res.data);

          if (ipLocationInfo) {
            createUserDto.country = ipLocationInfo.countryCode;
            createUserDto.region = ipLocationInfo.regionName;
            createUserDto.city = ipLocationInfo.city;
          }
        } catch (error) {
          this.logger.error(
            'Failed to get location info from request ip',
            error,
          );
        }
      }
      user = (await this.userService.create(createUserDto)).data.user;
    }

    return user;
  }

  async generateTokens(profile: any, ipAddress?: string) {
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

    const createUserDto: CreateUserDto = {
      name: profile.firstName,
      email: profile.email,
    };

    const registeredUser = await this.findOrCreateUser(
      createUserDto,
      ipAddress,
    );
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
