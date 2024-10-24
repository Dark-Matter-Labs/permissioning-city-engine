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
import { PermissionResponseService } from './permission-response.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FindAllPermissionResponseDto } from './dto';
import { UserService } from '../user/user.service';
import { SpacePermissionerService } from '../space-permissioner/space-permissioner.service';
import { ApprovePermissionResponseDto } from './dto/approve-permission-response.dto';
import { RejectPermissionResponseDto } from './dto/reject-permission-response.dto';

@ApiTags('permission')
@Controller('api/v1/permission/response')
export class PermissionResponseController {
  constructor(
    private readonly permissionResponseService: PermissionResponseService,
    private readonly userService: UserService,
    private readonly spacePermissionerService: SpacePermissionerService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all PermissionResponses' })
  @UseGuards(JwtAuthGuard)
  async findAll(@Req() req, @Query() query: FindAllPermissionResponseDto) {
    const user = await this.userService.findOneByEmail(req.user.email);
    const { page, limit, permissionRequestId, statuses } = query;
    const spacePermissioners =
      await this.spacePermissionerService.findAllByUserId(
        user.id,
        {
          isActive: true,
        },
        false,
      );

    return this.permissionResponseService.findAll({
      page,
      limit,
      permissionRequestId,
      spacePermissionerIds: spacePermissioners?.data?.map((item) => item.id),
      statuses,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get PermissionResponse by id' })
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.permissionResponseService.findOneById(id);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'PermissionResponse with approve' })
  @UseGuards(JwtAuthGuard)
  async approve(
    @Req() req,
    @Param('id') id: string,
    @Body() approvePermissionResponseDto: ApprovePermissionResponseDto,
  ) {
    const user = await this.userService.findOneByEmail(req.user.email);
    const permissionResponse =
      await this.permissionResponseService.findOneById(id);

    const { permissionRequest, spacePermissioner } = permissionResponse;

    if (user.id !== spacePermissioner.userId) {
      throw new ForbiddenException();
    }

    if (permissionRequest.resolveStatus != null) {
      throw new BadRequestException(
        'Cannot update already resolved permission request.',
      );
    }

    if (permissionResponse.timeoutAt < new Date()) {
      throw new BadRequestException('Cannot update after response timeout.');
    }

    return this.permissionResponseService.updateToApproved(
      id,
      approvePermissionResponseDto,
    );
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'PermissionResponse with reject' })
  @UseGuards(JwtAuthGuard)
  async reject(
    @Req() req,
    @Param('id') id: string,
    @Body() rejectPermissionResponseDto: RejectPermissionResponseDto,
  ) {
    const user = await this.userService.findOneByEmail(req.user.email);
    const permissionResponse =
      await this.permissionResponseService.findOneById(id);

    const { permissionRequest, spacePermissioner } = permissionResponse;

    if (user.id !== spacePermissioner.userId) {
      throw new ForbiddenException();
    }

    if (permissionRequest.resolveStatus != null) {
      throw new BadRequestException(
        'Cannot update already resolved permission request.',
      );
    }

    if (permissionResponse.timeoutAt < new Date()) {
      throw new BadRequestException('Cannot update after response timeout.');
    }

    return this.permissionResponseService.updateToRejected(
      id,
      rejectPermissionResponseDto,
    );
  }
}
