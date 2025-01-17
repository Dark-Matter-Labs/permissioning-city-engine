import { BadRequestException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { JwtPayloadDto } from '../token/dto';
import { UserService } from 'src/api/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: (req) => {
        if (req && req.cookies && req.cookies['accessToken']) {
          return req.cookies['accessToken'];
        } else if (req && req.headers && req.headers?.authorization) {
          return req.headers?.authorization.replace('Bearer ', '');
        }

        return ExtractJwt.fromAuthHeaderAsBearerToken();
      },
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'), // Your JWT secret from the config
    });
  }

  async validate(payload: JwtPayloadDto) {
    // Add validation logic, such as checking if the user exists in the database
    const user = await this.userService.findOneByEmail(payload.email);

    if (!user) {
      throw new BadRequestException(`User does not exist: ${payload.email}`);
    }

    return {
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      picture: payload.picture,
    };
  }
}
