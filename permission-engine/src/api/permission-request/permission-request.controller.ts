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
  CreateSpaceEventPermissionRequestDto,
  CreateSpaceEventRulePreApprovePermissionRequestDto,
  CreateSpaceRuleChangePermissionRequestDto,
} from './dto';
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

  @Get('code/:permissionCode')
  @ApiOperation({ summary: 'Get PermissionRequest by permissionCode' })
  @UseGuards(JwtAuthGuard)
  findOneByPermissionCode(@Param('permissionCode') permissionCode: string) {
    return this.permissionRequestService.findOneByPermissionCode(
      permissionCode,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get PermissionRequest by id' })
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.permissionRequestService.findOneById(id);
  }

  @Post('pre-approve')
  @ApiOperation({
    summary: 'Create space event rule pre approve PermissionRequest',
  })
  @UseGuards(JwtAuthGuard)
  async spaceEventRulePreApprovePermissionRequest(
    @Req() req,
    @Body()
    createSpaceEventRulePreApprovePermissionRequestDto: CreateSpaceEventRulePreApprovePermissionRequestDto,
  ) {
    const user = await this.userService.findOneByEmail(req.user.email);
    const { spaceId } = createSpaceEventRulePreApprovePermissionRequestDto;

    const isSpacePermissioner =
      await this.spacePermissionerService.isSpacePermissioner(spaceId, user.id);

    if (isSpacePermissioner === false) {
      throw new ForbiddenException('user must be a space permissioner');
    }

    return this.permissionRequestService.create(
      createSpaceEventRulePreApprovePermissionRequestDto,
    );
  }

  @Post('rule-change')
  @ApiOperation({ summary: 'Create space rule change PermissionRequest' })
  @UseGuards(JwtAuthGuard)
  async spaceRuleChangePermissionRequest(
    @Req() req,
    @Body()
    createSpaceRuleChangePermissionRequestDto: CreateSpaceRuleChangePermissionRequestDto,
  ) {
    const user = await this.userService.findOneByEmail(req.user.email);
    const { spaceId } = createSpaceRuleChangePermissionRequestDto;

    // space rule change permission request

    const isSpacePermissioner =
      await this.spacePermissionerService.isSpacePermissioner(spaceId, user.id);

    if (isSpacePermissioner === false) {
      throw new ForbiddenException('user must be a space permissioner');
    }

    return this.permissionRequestService.create(
      createSpaceRuleChangePermissionRequestDto,
    );
  }

  @Post('event')
  @ApiOperation({ summary: 'Create space event PermissionRequest' })
  @UseGuards(JwtAuthGuard)
  async spaceEventPermissionRequest(
    @Req() req,
    @Body() createPermissionRequestDto: CreateSpaceEventPermissionRequestDto,
  ) {
    const user = await this.userService.findOneByEmail(req.user.email);
    const { spaceEventId } = createPermissionRequestDto;

    if (spaceEventId != null) {
      // space event permission request
      const spaceEvent = await this.spaceEventService.findOneById(spaceEventId);

      if (spaceEvent.spaceId == null) {
        throw new BadRequestException('spaceId not assigned to spaceEvent');
      }

      if (spaceEvent.organizerId !== user.id) {
        throw new ForbiddenException('user must be an event organizer');
      }
    } else {
      throw new BadRequestException();
    }

    return this.permissionRequestService.create(createPermissionRequestDto);
  }

  @Put(':id/cancel')
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

  @Put(':id/accept')
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

  @Put(':id/drop')
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
