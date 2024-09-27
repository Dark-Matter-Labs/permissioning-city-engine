import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../../database/entity/user.entity';
import { GoogleAuthGuard } from 'src/auth/google-auth.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto';

@ApiTags('user')
@Controller('api/v1/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiResponse({ status: 200, description: 'Get self user data', type: User })
  @UseGuards(GoogleAuthGuard)
  findSelf(@Req() req): Promise<User> {
    return this.userService.findByEmail(req.user.email);
  }

  @Post()
  @ApiOperation({ summary: 'Create a user' })
  @ApiResponse({ status: 201, description: 'Create a user', type: User })
  @UseGuards(GoogleAuthGuard)
  create(@Req() req, @Body() createUserDto: CreateUserDto): Promise<User> {
    if (createUserDto.email !== req.user.email) {
      throw new ForbiddenException();
    }
    return this.userService.create(createUserDto);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 201, description: 'Delete a user' })
  @UseGuards(GoogleAuthGuard)
  remove(@Req() req): Promise<void> {
    return this.userService.remove(req.user.email);
  }
}
