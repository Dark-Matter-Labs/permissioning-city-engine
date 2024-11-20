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
import { RuleTarget } from 'src/lib/type';

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
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all rules' })
  async findAll(@Req() req, @Query() query: FindAllRuleDto) {
    const user = await this.userService.findOneByEmail(req.user.email);
    const {
      page,
      limit,
      target,
      authorId,
      parentRuleId,
      hash,
      publicHash,
      ids,
    } = query;

    return this.ruleService.findAll(
      {
        page,
        limit,
        target,
        authorId,
        parentRuleId,
        hash,
        publicHash,
        ids,
      },
      {
        isPagination: true,
        isPublicOnly: true,
        queryUserId: user.id,
      },
    );
  }

  @Get('space/:spaceId')
  @ApiOperation({ summary: 'Get rule by spaceId' })
  @UseGuards(JwtAuthGuard)
  async findOneBySpaceId(
    @Req() req,
    @Param('spaceId') spaceId: string,
  ): Promise<Rule> {
    const user = await this.userService.findOneByEmail(req.user.email);
    const rule = await this.ruleService.findOneBySpaceId(spaceId);

    if (!rule) {
      throw new BadRequestException(
        `There is no rule with spaceId: ${spaceId}`,
      );
    }

    const publicRuleBlocks = rule?.ruleBlocks?.filter(
      (ruleBlock) => ruleBlock.isPublic === true,
    );
    const spaces =
      (await this.spaceService.findAllByRuleId(rule.id))?.data ?? [];
    const spaceEvents =
      (
        await this.spaceEventService.findAll(
          {
            ruleId: rule.id,
          },
          { isPagination: false },
        )
      )?.data ?? [];
    const spacePermissioners: SpacePermissioner[] = [];

    for (const space of spaces) {
      await this.spacePermissionerService
        .findAllBySpaceId(space.id, { isActive: true }, { isPagination: false })
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
          { isPagination: false },
        )
      )?.data ?? [];
    const spacePermissioners: SpacePermissioner[] = [];

    for (const space of spaces) {
      await this.spacePermissionerService
        .findAllBySpaceId(space.id, { isActive: true }, { isPagination: false })
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

    const { target } = createRuleDto;
    if ([RuleTarget.space, RuleTarget.spaceEvent].includes(target) === false) {
      throw new BadRequestException(`Unsupported rule target: ${target}`);
    }
    return target === RuleTarget.space
      ? this.ruleService.createSpaceRule(user.id, createRuleDto)
      : this.ruleService.createSpaceEventRule(user.id, createRuleDto);
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
    const rule = await this.ruleService.findOneById(id);

    const isPublicOnly = user.id === rule.authorId;

    return this.ruleService.fork(
      user.id,
      { ...forkRuleDto, id },
      { isPublicOnly },
    );
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
    const { hash } = updateRuleDto;

    if (hash) {
      throw new ForbiddenException(`Cannot update hash`);
    }

    if (!rule) {
      throw new BadRequestException(`There is no rule with id: ${id}`);
    }

    if (rule.authorId !== user.id) {
      throw new ForbiddenException();
    }

    return this.ruleService.archiveAndUpdate(id, updateRuleDto);
  }
}
