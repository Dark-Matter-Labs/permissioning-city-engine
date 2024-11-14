import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { FindAllSpaceHistoryDto } from './dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from '../user/user.service';
import { SpaceService } from '../space/space.service';
import { Logger } from 'src/lib/logger/logger.service';
import { SpacePermissionerService } from '../space-permissioner/space-permissioner.service';
import { SpaceHistoryService } from './space-history.service';
import { User } from 'src/database/entity/user.entity';

@ApiTags('space')
@Controller('api/v1/space/history')
export class SpaceHistoryController {
  constructor(
    private readonly spaceHistoryService: SpaceHistoryService,
    private readonly userService: UserService,
    private readonly spaceService: SpaceService,
    private readonly spacePermissionerService: SpacePermissionerService,
    private readonly logger: Logger,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all SpaceHistory' })
  async findAll(@Req() req, @Query() query: FindAllSpaceHistoryDto) {
    const { page, limit, spaceId } = query;
    let { isPublic } = query;
    let user: User | null = null;

    if (req.user) {
      user = await this.userService.findOneByEmail(req.user.email);
    }

    const spacePermissioners =
      (
        await this.spacePermissionerService.findAllBySpaceId(
          spaceId,
          { isActive: true },
          false,
        )
      )?.data ?? [];

    if (
      user &&
      [...spacePermissioners.map((item) => item.userId)].includes(user.id) ===
        true
    ) {
      isPublic = false;
    } else {
      isPublic = true;
    }

    return this.spaceHistoryService.findAll({
      page,
      limit,
      spaceId,
      isPublic,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a SpaceHistory by id' })
  findOne(@Param('id') id: string) {
    return this.spaceHistoryService.findOneById(id);
  }
}
