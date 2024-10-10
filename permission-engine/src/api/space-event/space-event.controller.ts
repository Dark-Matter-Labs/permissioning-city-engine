import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateSpaceEventDto, UpdateSpaceEventDto } from './dto';
import { SpaceEventService } from './space-event.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserService } from '../user/user.service';
import { FindAllSpaceEventDto } from './dto/find-all-space-event.dto';

@ApiTags('event')
@Controller('api/v1/event')
export class SpaceEventController {
  constructor(
    private readonly spaceEventService: SpaceEventService,
    private readonly userService: UserService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all SpaceEvents' })
  findAll(@Query() query: FindAllSpaceEventDto) {
    const {
      page,
      limit,
      organizerId,
      spaceId,
      externalServiceId,
      permissionRequestId,
      statuses,
      topicIds,
      startsAfter,
      name,
    } = query;

    if (limit > 100) {
      // limit cannot exceed 100
      throw new ForbiddenException();
    }

    return this.spaceEventService.findAll({
      page,
      limit,
      organizerId,
      spaceId,
      externalServiceId,
      permissionRequestId,
      statuses,
      topicIds,
      startsAfter,
      name,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a SpaceEvent' })
  findOne(@Param('id') id: string) {
    return this.spaceEventService.findOneById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create SpaceEvent' })
  @UseGuards(JwtAuthGuard)
  async create(@Req() req, @Body() createSpaceEventDto: CreateSpaceEventDto) {
    const user = await this.userService.findOneByEmail(req.user.email);

    return this.spaceEventService.create(user.id, createSpaceEventDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update SpaceEvent' })
  @UseGuards(JwtAuthGuard)
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateSpaceEventDto: UpdateSpaceEventDto,
  ) {
    const user = await this.userService.findOneByEmail(req.user.email);
    const spaceEvent = await this.spaceEventService.findOneById(id);

    if (spaceEvent.organizerId !== user.id) {
      throw new ForbiddenException();
    }

    return this.spaceEventService.update(id, updateSpaceEventDto);
  }
}
