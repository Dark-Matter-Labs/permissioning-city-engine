import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { GoogleStrategy } from './strategy/google.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entity/user.entity';
import { UserService } from 'src/api/user/user.service';
import { RefreshTokenService } from './token/refresh-token.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import { Logger } from 'src/lib/logger/logger.service';
import configuration from 'src/config/configuration';
import { LoggerModule } from 'src/lib/logger/logger.module';
import { RefreshTokenModule } from './token/refresh-token.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}s`,
        },
      }),
    }),
    RefreshTokenModule,
    LoggerModule,
  ],
  providers: [
    AuthService,
    UserService,
    RefreshTokenService,
    GoogleStrategy,
    JwtStrategy,
    Logger,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
