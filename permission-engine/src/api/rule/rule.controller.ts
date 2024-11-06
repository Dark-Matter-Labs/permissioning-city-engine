import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ForbiddenException,
  Query,
  Req,
  Put,
  BadRequestException,
} from '@nestjs/common';
import { RuleService } from './rule.service';
import { Rule } from '../../database/entity/rule.entity';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateRuleDto } from './dto/create-rule.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ForkRuleDto, UpdateRuleDto } from './dto';
import { FindAllRuleDto } from './dto';
import { UserService } from '../user/user.service';
import { SpaceEventService } from '../space-event/space-event.service';
import { SpacePermissionerService } from '../space-permissioner/space-permissioner.service';
import { SpaceService } from '../space/space.service';
import { SpacePermissioner } from 'src/database/entity/space-permissioner.entity';

@ApiTags('rule')
@Controller('api/v1/rule')
export class RuleController {
  constructor(
    private readonly ruleService: RuleService,
    private readonly spaceService: SpaceService,
    private readonly spaceEventService: SpaceEventService,
    private readonly spacePermissionerService: SpacePermissionerService,
    private readonly userService: UserService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all rules' })
  findAll(@Query() query: FindAllRuleDto) {
    const { page, limit, target, authorId, parentRuleId, hash, ids } = query;

    return this.ruleService.findAll({
      page,
      limit,
      target,
      authorId,
      parentRuleId,
      hash,
      ids,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get rule by id' })
  @UseGuards(JwtAuthGuard)
  async findOneById(@Req() req, @Param('id') id: string): Promise<Rule> {
    const user = await this.userService.findOneByEmail(req.user.email);
    const rule = await this.ruleService.findOneById(id);

    if (!rule) {
      throw new BadRequestException(`There is no rule with id: ${id}`);
    }

    const publicRuleBlocks = rule.ruleBlocks.filter(
      (ruleBlock) => ruleBlock.isPublic === true,
    );
    const spaces = (await this.spaceService.findAllByRuleId(id))?.data ?? [];
    const spaceEvents =
      (
        await this.spaceEventService.findAll(
          {
            ruleId: id,
          },
          false,
        )
      )?.data ?? [];
    const spacePermissioners: SpacePermissioner[] = [];

    for (const space of spaces) {
      await this.spacePermissionerService
        .findAllBySpaceId(space.id, { isActive: true }, false)
        .then((res) => {
          if (res.data) {
            spacePermissioners.push(...res.data);
          }
        });
    }

    if (
      [
        user.id,
        ...spaces.map((item) => item.ownerId),
        ...spaceEvents.map((item) => item.organizerId),
        ...spacePermissioners.map((item) => item.userId),
      ].includes(rule.authorId) === false
    ) {
      rule.ruleBlocks = publicRuleBlocks;
    }

    return rule;
  }

  @Post()
  @ApiOperation({ summary: 'Create a rule' })
  @UseGuards(JwtAuthGuard)
  async create(
    @Req() req,
    @Body() createRuleDto: CreateRuleDto,
  ): Promise<Rule> {
    const user = await this.userService.findOneByEmail(req.user.email);

    return this.ruleService.create(user.id, createRuleDto);
  }

  @Post(':id/fork')
  @ApiOperation({ summary: 'Fork a rule' })
  @UseGuards(JwtAuthGuard)
  async fork(
    @Req() req,
    @Param('id') id: string,
    @Body() forkRuleDto: ForkRuleDto,
  ): Promise<Rule> {
    const user = await this.userService.findOneByEmail(req.user.email);

    return this.ruleService.fork(user.id, { ...forkRuleDto, id });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update and archive rule' })
  @UseGuards(JwtAuthGuard)
  async archiveAndUpdate(
    @Req() req,
    @Param('id') id: string,
    @Body() updateRuleDto: UpdateRuleDto,
  ) {
    const user = await this.userService.findOneByEmail(req.user.email);
    const rule = await this.ruleService.findOneById(id);

    if (!rule) {
      throw new BadRequestException();
    }

    if (rule.authorId !== user.id) {
      throw new ForbiddenException();
    }

    return this.ruleService.archiveAndUpdate(id, updateRuleDto);
  }
}
