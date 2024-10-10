import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreatePermissionRequestDto } from './dto';
import { PermissionRequestService } from './permission-request.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FindAllPermissionRequestDto } from './dto';
import { SpaceEventService } from '../space-event/space-event.service';
import { SpaceService } from '../space/space.service';
import { UserService } from '../user/user.service';
import { SpacePermissionerService } from '../space-permissioner/space-permissioner.service';

@ApiTags('permission')
@Controller('api/v1/permission/request')
export class PermissionRequestController {
  constructor(
    private readonly permissionRequestService: PermissionRequestService,
    private readonly spaceService: SpaceService,
    private readonly userService: UserService,
    private readonly spaceEventService: SpaceEventService,
    private readonly spacePermissionerService: SpacePermissionerService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all PermissionRequests' })
  @UseGuards(JwtAuthGuard)
  findAll(@Query() query: FindAllPermissionRequestDto) {
    const { page, limit, spaceEventId, spaceId, ruleId, statuses } = query;

    if (limit > 100) {
      // limit cannot exceed 100
      throw new ForbiddenException();
    }

    return this.permissionRequestService.findAll({
      page,
      limit,
      spaceEventId,
      spaceId,
      ruleId,
      statuses,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get PermissionRequest by id' })
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.permissionRequestService.findOneById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create PermissionRequest' })
  @UseGuards(JwtAuthGuard)
  async create(
    @Req() req,
    @Body() createPermissionRequestDto: CreatePermissionRequestDto,
  ) {
    const user = await this.userService.findOneByEmail(req.user.email);
    const { spaceEventId, spaceRuleId, spaceId } = createPermissionRequestDto;

    if (spaceEventId != null && spaceRuleId != null) {
      throw new BadRequestException(
        'cannot create permission request with multiple purposes',
      );
    } else if (spaceEventId != null) {
      // space event permission request
      const spaceEvent = await this.spaceEventService.findOneById(spaceEventId);

      if (spaceEvent.organizerId !== user.id) {
        throw new ForbiddenException('user must be an event organizer');
      }
    } else if (spaceRuleId != null) {
      // space rule change permission request
      const isSpacePermissioner =
        await this.spacePermissionerService.isSpacePermissioner(
          spaceId,
          user.id,
        );

      if (isSpacePermissioner === false) {
        throw new ForbiddenException('user must be a space permissioner');
      }
    } else {
      throw new BadRequestException();
    }

    return this.permissionRequestService.create(createPermissionRequestDto);
  }

  // TODO. work on dedicated status updates
  // @Put(':id')
  // @ApiOperation({ summary: 'Update PermissionRequest' })
  // @UseGuards(JwtAuthGuard)
  // async update(
  //   @Req() req,
  //   @Param('id') id: string,
  //   @Body() updatePermissionRequestDto: UpdatePermissionRequestDto,
  // ) {
  //   const user = await this.userService.findOneByEmail(req.user.email);
  //   const permissionRequest =
  //     await this.permissionRequestService.findOneById(id);

  //   if (permissionRequest.organizerId !== user.id) {
  //     throw new ForbiddenException();
  //   }

  //   return this.permissionRequestService.update(id, updatePermissionRequestDto);
  // }
}
