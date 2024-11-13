import {
  BadRequestException,
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
import {
  CreateSpaceEquipmentDto,
  FindAllSpaceEquipmentDto,
  FindAllSpaceFacilityDto,
  UpdateSpaceEquipmentDto,
} from './dto';
import { SpaceEquipmentService } from './space-equipment.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserService } from '../user/user.service';
import { SpaceService } from '../space/space.service';
import { Logger } from 'src/lib/logger/logger.service';

@ApiTags('space')
@Controller('api/v1/space/equipment')
export class SpaceEquipmentController {
  constructor(
    private readonly spaceEquipmentService: SpaceEquipmentService,
    private readonly spaceService: SpaceService,
    private readonly userService: UserService,
    private readonly logger: Logger,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all Space equipments' })
  findAllEquipment(@Query() query: FindAllSpaceEquipmentDto) {
    const { page, limit, spaceId, types, isActive } = query;

    return this.spaceEquipmentService.findAllEquipment({
      page,
      limit,
      spaceId,
      types,
      isActive,
    });
  }

  @Get('facility')
  @ApiOperation({ summary: 'Get all Space facilities' })
  findAllFacility(@Query() query: FindAllSpaceFacilityDto) {
    const { page, limit, spaceId, isActive } = query;

    return this.spaceEquipmentService.findAllFacility({
      page,
      limit,
      spaceId,
      isActive,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a SpaceEquipment' })
  findOne(@Param('id') id: string) {
    return this.spaceEquipmentService.findOneById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create SpaceEquipment' })
  async create(
    @Req() req,
    @Body() createSpaceEquipmentDto: CreateSpaceEquipmentDto,
  ) {
    const { spaceId } = createSpaceEquipmentDto;
    const user = await this.userService.findOneByEmail(req.user.email);
    const space = await this.spaceService.findOneById(spaceId);

    if (!space) {
      throw new BadRequestException(`There is no space with id: ${spaceId}`);
    }

    if (space.ownerId !== user.id) {
      throw new ForbiddenException();
    }

    const spaceEquipment = await this.spaceEquipmentService.create(
      createSpaceEquipmentDto,
    );

    return spaceEquipment;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update SpaceEquipment' })
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateSpaceEquipmentDto: UpdateSpaceEquipmentDto,
  ) {
    const user = await this.userService.findOneByEmail(req.user.email);
    const spaceEquipment = await this.spaceEquipmentService.findOneById(id);

    if (spaceEquipment.space.ownerId !== user.id) {
      throw new ForbiddenException();
    }

    return this.spaceEquipmentService.update(id, updateSpaceEquipmentDto);
  }
}
