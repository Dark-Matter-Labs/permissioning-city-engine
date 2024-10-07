import {
  Body,
  Controller,
  Delete,
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
import { SpaceEventStatus } from 'src/type';

@ApiTags('event')
@Controller('api/v1/event')
export class SpaceEventController {
  constructor(
    private readonly spaceEventService: SpaceEventService,
    private readonly userService: UserService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all SpaceEvents' })
  findAll(
    @Query('page') page: number | null,
    @Query('limit') limit: number | null,
    @Query('organizerId') organizerId: string | null,
    @Query('spaceId') spaceId: string | null,
    @Query('externalServiceId') externalServiceId: string | null,
    @Query('permissionRequestId') permissionRequestId: string | null,
    @Query('statuses') statuses: SpaceEventStatus[] | null,
    @Query('topicIds') topicIds: string[] | null,
    @Query('startsAfter') startsAfter: Date | null,
    @Query('name') name: string | null,
  ) {
    if (limit > 100) {
      // limit cannot exceed 100
      throw new ForbiddenException();
    }

    return this.spaceEventService.findAll(
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
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a SpaceEvent' })
  findOne(@Param('id') id: string) {
    return this.spaceEventService.findOneById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create SpaceEvent' })
  @UseGuards(JwtAuthGuard)
  create(@Body() createSpaceEventDto: CreateSpaceEventDto) {
    return this.spaceEventService.create(createSpaceEventDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update SpaceEvent' })
  @UseGuards(JwtAuthGuard)
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateSpaceEventDto: UpdateSpaceEventDto,
  ) {
    const user = await this.userService.findByEmail(req.user.email);
    const spaceEvent = await this.spaceEventService.findOneById(id);

    if (spaceEvent.organizerId !== user.id) {
      throw new ForbiddenException();
    }

    return this.spaceEventService.update(id, updateSpaceEventDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a SpaceEvent' })
  @UseGuards(JwtAuthGuard)
  async remove(
    @Req() req,
    @Param('id') id: string,
  ): Promise<{ result: string; error?: any }> {
    const user = await this.userService.findByEmail(req.user.email);
    const spaceEvent = await this.spaceEventService.findOneById(id);
    if (spaceEvent.organizerId !== user.id) {
      throw new ForbiddenException();
    }

    return this.spaceEventService
      .remove(id)
      .then(() => {
        return { result: 'success' };
      })
      .catch((error) => {
        return { result: 'fail', error };
      });
  }
}
