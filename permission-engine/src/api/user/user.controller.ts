import { Controller, Get, UseGuards, Req, Put, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../../database/entity/user.entity';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateResult } from 'typeorm';
import { UpdateUserDto } from './dto';

@ApiTags('user')
@Controller('api/v1/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiResponse({ status: 200, description: 'Get self user data', type: User })
  @UseGuards(JwtAuthGuard)
  findSelf(@Req() req): Promise<User> {
    return this.userService.findByEmail(req.user.email);
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  updateSelf(
    @Req() req,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UpdateResult> {
    return this.userService.update(req.user.email, updateUserDto);
  }
}
