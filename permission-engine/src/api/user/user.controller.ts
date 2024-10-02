import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../../database/entity/user.entity';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

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

  // @Post()
  // @ApiOperation({ summary: 'Create a user' })
  // @ApiResponse({ status: 201, description: 'Create a user', type: User })
  // @UseGuards(GoogleAuthGuard)
  // create(@Req() req, @Body() createUserDto: CreateUserDto): Promise<User> {
  //   if (createUserDto.email !== req.user.email) {
  //     throw new ForbiddenException();
  //   }
  //   return this.userService.create(createUserDto);
  // }

  // @Delete()
  // @ApiOperation({ summary: 'Delete a user' })
  // @ApiResponse({ status: 201, description: 'Delete a user' })
  // @UseGuards(JwtAuthGuard)
  // remove(@Req() req): Promise<void> {
  //   return this.userService.remove(req.user.email);
  // }
}
