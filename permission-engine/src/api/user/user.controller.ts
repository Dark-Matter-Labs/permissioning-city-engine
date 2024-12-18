import {
  Controller,
  Get,
  UseGuards,
  Req,
  Put,
  Body,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../../database/entity/user.entity';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateUserDto } from './dto';

@ApiTags('user')
@Controller('api/v1/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiResponse({ status: 200, description: 'Get self user data', type: User })
  @UseGuards(JwtAuthGuard)
  findSelf(@Req() req): Promise<User> {
    return this.userService.findOneByEmail(req.user.email);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Get public user data', type: User })
  findPublicData(@Param('id') id: string): Promise<Partial<User>> {
    return this.userService.findPublicDataById(id);
  }

  // TODO. validate user location information
  @Put()
  @UseGuards(JwtAuthGuard)
  updateSelf(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(req.user.email, updateUserDto);
  }

  @Put('topic/add/:topicId')
  @UseGuards(JwtAuthGuard)
  async addTopic(@Req() req, @Param('topicId') topicId: string) {
    const user = await this.userService.findOneByEmail(req.user.email);
    return this.userService.addTopic(user.id, topicId);
  }

  @Put('topic/remove/:topicId')
  @UseGuards(JwtAuthGuard)
  async removeTopic(@Req() req, @Param('topicId') topicId: string) {
    const user = await this.userService.findOneByEmail(req.user.email);
    return this.userService.removeTopic(user.id, topicId);
  }
}
