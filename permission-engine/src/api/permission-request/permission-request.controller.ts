import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreatePermissionRequestDto } from './dto';
import { PermissionRequestService } from './permission-request.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PermissionRequestStatus } from 'src/lib/type';

@ApiTags('permission')
@Controller('api/v1/permission/request')
export class PermissionRequestController {
  constructor(
    private readonly permissionRequestService: PermissionRequestService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all PermissionRequests' })
  findAll(
    @Query('page') page: number | null,
    @Query('limit') limit: number | null,
    @Query('spaceId') spaceId: string | null,
    @Query('spaceEventId') spaceEventId: string | null,
    @Query('ruleId') ruleId: string | null,
    @Query('statuses') statuses: PermissionRequestStatus[] | null,
  ) {
    if (limit > 100) {
      // limit cannot exceed 100
      throw new ForbiddenException();
    }

    return this.permissionRequestService.findAll(
      page,
      limit,
      spaceEventId,
      spaceId,
      ruleId,
      statuses,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get PermissionRequest by id' })
  findOne(@Param('id') id: string) {
    return this.permissionRequestService.findOneById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create PermissionRequest' })
  @UseGuards(JwtAuthGuard)
  create(@Body() createPermissionRequestDto: CreatePermissionRequestDto) {
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
  //   const user = await this.userService.findByEmail(req.user.email);
  //   const permissionRequest =
  //     await this.permissionRequestService.findOneById(id);

  //   if (permissionRequest.organizerId !== user.id) {
  //     throw new ForbiddenException();
  //   }

  //   return this.permissionRequestService.update(id, updatePermissionRequestDto);
  // }
}
