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
  Query,
} from '@nestjs/common';
import { SpacePermissionerService } from './space-permissioner.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { SpacePermissioner } from 'src/database/entity/space-permissioner.entity';
import { CreateSpacePermissionerDto, UpdateSpacePermissionerDto } from './dto';
import { UpdateResult } from 'typeorm';
import { UserService } from '../user/user.service';
import { PaginationDto } from 'src/lib/dto';

@ApiTags('permissioner')
@Controller('api/v1/permissioner')
export class SpacePermissionerController {
  constructor(
    private readonly spacePermissionerService: SpacePermissionerService,
    private readonly userService: UserService,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get spacePermissioner by id' })
  findOneById(@Param('id') id: string): Promise<SpacePermissioner> {
    return this.spacePermissionerService.findOneById(id);
  }

  @Get('space/:spaceId')
  @ApiOperation({ summary: 'Get spacePermissioner by spaceId' })
  findBySpaceId(
    @Param('spaceId') spaceId: string,
    @Query() query: PaginationDto,
  ): Promise<{ data: SpacePermissioner[]; total: number }> {
    return this.spacePermissionerService.findBySpaceId({
      spaceId,
      ...query,
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a spacePermissioner' })
  create(
    @Body() createSpacePermissionerDto: CreateSpacePermissionerDto,
  ): Promise<SpacePermissioner> {
    return this.spacePermissionerService.create(createSpacePermissionerDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update spacePermissioner isActive status' })
  async update(
    @Req() req,
    @Body() updateSpacePermissionerDto: UpdateSpacePermissionerDto,
  ): Promise<UpdateResult> {
    const user = await this.userService.findOneByEmail(req.user.email);
    const { id } = updateSpacePermissionerDto;
    const spacePermissioner =
      await this.spacePermissionerService.findOneById(id);

    if (spacePermissioner.userId !== user.id) {
      throw new ForbiddenException();
    }
    return this.spacePermissionerService.update(updateSpacePermissionerDto);
  }
}
