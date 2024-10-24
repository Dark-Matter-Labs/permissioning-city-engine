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
import { UserService } from '../user/user.service';
import { SpacePermissionerService } from '../space-permissioner/space-permissioner.service';
import { PermissionRequestStatus } from 'src/lib/type';

@ApiTags('permission')
@Controller('api/v1/permission/request')
export class PermissionRequestController {
  constructor(
    private readonly permissionRequestService: PermissionRequestService,
    private readonly userService: UserService,
    private readonly spaceEventService: SpaceEventService,
    private readonly spacePermissionerService: SpacePermissionerService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all PermissionRequests' })
  @UseGuards(JwtAuthGuard)
  findAll(@Query() query: FindAllPermissionRequestDto) {
    const { page, limit, spaceEventId, spaceId, ruleId, statuses } = query;

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

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel PermissionRequest' })
  @UseGuards(JwtAuthGuard)
  async cancel(@Req() req, @Param('id') id: string) {
    const user = await this.userService.findOneByEmail(req.user.email);
    const permissionRequest =
      await this.permissionRequestService.findOneById(id);

    if (permissionRequest.spaceEvent.organizerId !== user.id) {
      throw new ForbiddenException();
    }

    return this.permissionRequestService.updateToResolveCancelled(id);
  }

  @Post(':id/accept')
  @ApiOperation({ summary: 'Accept approved PermissionRequest review result' })
  @UseGuards(JwtAuthGuard)
  async accept(
    @Req() req,
    @Param('id') id: string,
  ): Promise<{
    data: {
      permissionCode: string;
    };
  }> {
    const user = await this.userService.findOneByEmail(req.user.email);
    const permissionRequest =
      await this.permissionRequestService.findOneById(id);

    if (permissionRequest.spaceEvent.organizerId !== user.id) {
      throw new ForbiddenException();
    }

    if (
      [
        PermissionRequestStatus.reviewApproved,
        PermissionRequestStatus.reviewApprovedWithCondition,
      ].includes(permissionRequest.status) === false
    ) {
      throw new ForbiddenException(
        'Cannot accept unapproved permissionRequest.',
      );
    }

    return this.permissionRequestService.updateToResolveAccepted(id);
  }

  @Post(':id/drop')
  @ApiOperation({ summary: 'Drop approved PermissionRequest review result' })
  @UseGuards(JwtAuthGuard)
  async drop(@Req() req, @Param('id') id: string) {
    const user = await this.userService.findOneByEmail(req.user.email);
    const permissionRequest =
      await this.permissionRequestService.findOneById(id);

    if (permissionRequest.spaceEvent.organizerId !== user.id) {
      throw new ForbiddenException();
    }

    if (
      [
        PermissionRequestStatus.reviewApproved,
        PermissionRequestStatus.reviewApprovedWithCondition,
      ].includes(permissionRequest.status) === false
    ) {
      throw new ForbiddenException('Cannot drop unapproved permissionRequest.');
    }

    return this.permissionRequestService.updateToResolveDropped(id);
  }
}
