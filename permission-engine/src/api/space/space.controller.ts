import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Put,
  ForbiddenException,
} from '@nestjs/common';
import { SpaceService } from './space.service';
import { Space } from '../../database/entity/space.entity';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateSpaceDto } from './dto/create-space.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateSpaceDto } from './dto';
import { UpdateResult } from 'typeorm';
import { UserService } from '../user/user.service';
import { SpacePermissioner } from 'src/database/entity/space-permissioner.entity';
import { SpacePermissionerService } from '../space-permissioner/space-permissioner.service';

@ApiTags('space')
@Controller('api/v1/space')
export class SpaceController {
  constructor(
    private readonly spaceService: SpaceService,
    private readonly userService: UserService,
    private readonly spacePermissionerService: SpacePermissionerService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all spaces' })
  findAll(): Promise<Space[]> {
    return this.spaceService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get space by id' })
  findOneById(@Param('id') id: string): Promise<Space> {
    return this.spaceService.findOneById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a space' })
  @UseGuards(JwtAuthGuard)
  async create(
    @Req() req,
    @Body() createSpaceDto: CreateSpaceDto,
  ): Promise<{ space: Space; spacePermissioner: SpacePermissioner }> {
    const user = await this.userService.findOneByEmail(req.user.email);
    const space = await this.spaceService.create(user.id, createSpaceDto);
    const spacePermissioner = await this.spacePermissionerService.create(
      {
        spaceId: space.id,
        userId: user.id,
      },
      true,
    );

    return { space, spacePermissioner };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a space' })
  @UseGuards(JwtAuthGuard)
  async update(
    @Req() req,
    @Body() updateSpaceDto: UpdateSpaceDto,
  ): Promise<UpdateResult> {
    const user = await this.userService.findOneByEmail(req.user.email);
    const { id } = updateSpaceDto;
    const space = await this.spaceService.findOneById(id);

    if (space.ownerId !== user.id) {
      throw new ForbiddenException();
    }

    return this.spaceService.update(updateSpaceDto);
  }
}
