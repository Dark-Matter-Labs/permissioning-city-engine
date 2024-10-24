import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  ForbiddenException,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { SpacePermissionerService } from './space-permissioner.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { SpacePermissioner } from 'src/database/entity/space-permissioner.entity';
import {
  FindAllSpacePermissionerByUserIdDto,
  InviteSpacePermissionerDto,
} from './dto';
import { UserService } from '../user/user.service';
import { PaginationDto } from 'src/lib/dto';
import { SpaceService } from '../space/space.service';

@ApiTags('permissioner')
@Controller('api/v1/permissioner')
export class SpacePermissionerController {
  constructor(
    private readonly spacePermissionerService: SpacePermissionerService,
    private readonly userService: UserService,
    private readonly spaceService: SpaceService,
  ) {}

  @Get('self')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get SpacePermissioners by userId' })
  async findSelf(
    @Req() req,
    @Query() query: FindAllSpacePermissionerByUserIdDto,
  ): Promise<{ data: SpacePermissioner[]; total: number }> {
    const user = await this.userService.findOneByEmail(req.user.email);
    return this.spacePermissionerService.findAllByUserId(user.id, query);
  }

  @Get(':spaceId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get SpacePermissioners by spaceId' })
  async findAllBySpaceId(
    @Req() req,
    @Param('spaceId') spaceId: string,
    @Query() query: PaginationDto,
  ): Promise<{ data: SpacePermissioner[]; total: number }> {
    const user = await this.userService.findOneByEmail(req.user.email);
    const isSpacePermissioner =
      await this.spacePermissionerService.isSpacePermissioner(spaceId, user.id);

    if (isSpacePermissioner === false) {
      throw new ForbiddenException();
    }

    return this.spacePermissionerService.findAllBySpaceId(spaceId, query);
  }

  @Post(':spaceId/invite')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Invite a SpacePermissioner' })
  async invite(
    @Req() req,
    @Param('spaceId') spaceId: string,
    @Body() inviteSpacePermissionerDto: InviteSpacePermissionerDto,
  ): Promise<SpacePermissioner> {
    const { userId } = inviteSpacePermissionerDto;
    const inviter = await this.userService.findOneByEmail(req.user.email);
    const isInviterSpacePermissioner =
      await this.spacePermissionerService.isSpacePermissioner(
        spaceId,
        inviter.id,
      );

    const existingSpacePermissioner =
      await this.spacePermissionerService.findOneByUserIdAndSpaceId(
        userId,
        spaceId,
      );
    const isSpacePermissioner =
      existingSpacePermissioner && existingSpacePermissioner.isActive === true;

    if (isInviterSpacePermissioner === false) {
      throw new ForbiddenException();
    }

    if (isSpacePermissioner === true) {
      throw new BadRequestException('Already a permissioner');
    }

    if (existingSpacePermissioner) {
      throw new BadRequestException('Already invited');
    }

    return this.spacePermissionerService.create(
      {
        ...inviteSpacePermissionerDto,
        spaceId,
        inviterId: inviter.id,
      },
      false,
    );
  }

  @Post(':spaceId/join')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Join SpacePermissioner' })
  async join(
    @Req() req,
    @Param('spaceId') spaceId: string,
  ): Promise<SpacePermissioner> {
    const user = await this.userService.findOneByEmail(req.user.email);
    const existingSpacePermissioner =
      await this.spacePermissionerService.findOneByUserIdAndSpaceId(
        user.id,
        spaceId,
      );
    const isSpacePermissioner =
      existingSpacePermissioner && existingSpacePermissioner.isActive === true;

    if (isSpacePermissioner === true) {
      throw new BadRequestException(`Already a permissioner.`);
    }

    if (existingSpacePermissioner) {
      await this.spacePermissionerService.update({
        id: existingSpacePermissioner.id,
        isActive: true,
      });

      return { ...existingSpacePermissioner, isActive: true };
    } else {
      return this.spacePermissionerService.create(
        {
          spaceId,
          userId: user.id,
        },
        true,
      );
    }
  }

  @Post(':spaceId/leave')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Leave or rejoin SpacePermissioner',
  })
  async leave(@Req() req, @Param('spaceId') spaceId: string) {
    const user = await this.userService.findOneByEmail(req.user.email);
    const isOwner = await this.spaceService.isOwner(spaceId, user.id);

    const spacePermissioner =
      await this.spacePermissionerService.findOneByUserIdAndSpaceId(
        user.id,
        spaceId,
      );

    if (isOwner === true && spacePermissioner.isActive === true) {
      throw new BadRequestException('Space owner cannot leave permissioner.');
    }

    return this.spacePermissionerService.update({
      id: spacePermissioner.id,
      isActive: false,
    });
  }
}
