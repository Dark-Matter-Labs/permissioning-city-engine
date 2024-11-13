import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  CreateSpaceApprovedRuleDto,
  FindAllSpaceApprovedRuleDto,
  UpdateSpaceApprovedRuleDto,
} from './dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Logger } from 'src/lib/logger/logger.service';
import { SpaceApprovedRuleService } from './space-approved-rule.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { SpaceService } from '../space/space.service';
import { UserService } from '../user/user.service';

@ApiTags('space')
@Controller('api/v1/space/approved-rule')
export class SpaceApprovedRuleController {
  constructor(
    private readonly spaceApprovedRuleService: SpaceApprovedRuleService,
    private readonly spaceService: SpaceService,
    private readonly userService: UserService,
    private readonly logger: Logger,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all SpaceApprovedRules by spaceId' })
  findAll(@Query() query: FindAllSpaceApprovedRuleDto) {
    const { page, limit, spaceId, ruleId, topicIds, isActive, sortBy } = query;

    return this.spaceApprovedRuleService.findAll({
      page,
      limit,
      spaceId,
      ruleId,
      isActive,
      topicIds,
      sortBy,
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create SpaceApprovedRule' })
  async create(
    @Req() req,
    @Body() createSpaceApprovedRuleDto: CreateSpaceApprovedRuleDto,
  ) {
    const { spaceId } = createSpaceApprovedRuleDto;
    const user = await this.userService.findOneByEmail(req.user.email);
    const space = await this.spaceService.findOneById(spaceId);

    if (!space) {
      throw new BadRequestException(`There is no space with id: ${spaceId}`);
    }

    if (space.ownerId !== user.id) {
      throw new ForbiddenException();
    }

    const spaceApprovedRule = await this.spaceApprovedRuleService.create(
      createSpaceApprovedRuleDto,
    );

    return spaceApprovedRule;
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Deactivate SpaceApprovedRule' })
  async update(
    @Req() req,
    @Body() updateSpaceApprovedRuleDto: UpdateSpaceApprovedRuleDto,
  ) {
    const { spaceId } = updateSpaceApprovedRuleDto;
    const user = await this.userService.findOneByEmail(req.user.email);
    const space = await this.spaceService.findOneById(spaceId);

    if (!space) {
      throw new BadRequestException(`There is no space with id: ${spaceId}`);
    }

    if (space.ownerId !== user.id) {
      throw new ForbiddenException();
    }

    const spaceApprovedRule = await this.spaceApprovedRuleService.update(
      updateSpaceApprovedRuleDto,
    );

    return spaceApprovedRule;
  }
}
