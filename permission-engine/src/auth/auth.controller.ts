import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Logger } from 'src/lib/logger/logger.service';

@ApiTags('auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly logger: Logger,
  ) {}

  @Get('google')
  @ApiOperation({ summary: 'Authenticate user by google login' })
  @UseGuards(AuthGuard('google'))
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async googleAuth(@Req() req: Request) {}

  @Get('google/callback')
  @ApiOperation({
    summary: 'Called by google auth callback and set JWT tokens in cookie',
  })
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const ipAddress = req.headers['x-forwarded-for'] || req.ip;
    const tokens = await this.authService.generateTokens(req.user, ipAddress);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME) * 1000,
    });

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME) * 1000,
      path: '/',
    });

    return res.redirect(process.env.GOOGLE_CALLBACK_DOMAIN);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token with refresh token' })
  async refresh(@Req() req, @Res() res: Response) {
    const refreshToken = req.cookies['refreshToken'];

    if (!refreshToken) {
      return res.status(403).json({ message: 'Refresh token not found' });
    }

    try {
      const accessToken =
        await this.authService.refreshAccessToken(refreshToken);

      // Set the new access token as a cookie
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME) * 1000,
      });

      return res.json({ message: 'Token refreshed successfully' });
    } catch (error) {
      this.logger.error(error.message, error);
      return res
        .status(403)
        .json({ message: 'Invalid or expired refresh token' });
    }
  }

  @Post('revoke')
  @ApiOperation({ summary: 'Revoke refresh token' })
  async revoke(@Req() req, @Res() res: Response) {
    const refreshToken = req.cookies['refreshToken'];

    if (!refreshToken) {
      return res.status(403).json({ message: 'Refresh token not found' });
    }

    await this.authService.revokeRefreshToken(refreshToken);

    // Clear the refresh token cookie
    res.clearCookie('refreshToken');

    return res.json({ message: 'Refresh token revoked' });
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get user google profile' })
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req) {
    // Access user information from the validated token
    return { ...req.user, name: `${req.user.firstName} ${req.user.lastName}` };
  }

  @Post('logout')
  @ApiOperation({ summary: 'User logout by clearing JWT tokens' })
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req, @Res() res: Response) {
    // Clear the access and refresh tokens from cookies and redis
    res.clearCookie('accessToken');
    const refreshToken = req.cookies['refreshToken'];

    if (refreshToken) {
      await this.authService.revokeRefreshToken(refreshToken);
      res.clearCookie('refreshToken');
    }

    return res.json({ message: 'Logout successful' });
  }
}
