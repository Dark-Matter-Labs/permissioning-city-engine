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
} from '@nestjs/common';
import { RuleService } from './rule.service';
import { Rule } from '../../database/entity/rule.entity';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateRuleDto } from './dto/create-rule.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ForkRuleDto, UpdateRuleDto } from './dto';
import { UpdateResult } from 'typeorm';
import { FindAllRuleDto } from './dto';
import { UserService } from '../user/user.service';

@ApiTags('rule')
@Controller('api/v1/rule')
export class RuleController {
  constructor(
    private readonly ruleService: RuleService,
    private readonly userService: UserService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all rules' })
  findAll(@Query() query: FindAllRuleDto) {
    const { page, limit, target, authorId, parentRuleId, hash } = query;

    if (limit > 100) {
      // limit cannot exceed 100
      throw new ForbiddenException();
    }

    return this.ruleService.findAll({
      page,
      limit,
      target,
      authorId,
      parentRuleId,
      hash,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get rule by id' })
  findOneById(@Param('id') id: string): Promise<Rule> {
    return this.ruleService.findOneById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a rule' })
  @UseGuards(JwtAuthGuard)
  create(@Body() createRuleDto: CreateRuleDto): Promise<Rule> {
    return this.ruleService.create(createRuleDto);
  }

  @Post('fork')
  @ApiOperation({ summary: 'Fork a rule' })
  @UseGuards(JwtAuthGuard)
  async fork(@Req() req, @Body() forkRuleDto: ForkRuleDto): Promise<Rule> {
    const user = await this.userService.findOneByEmail(req.user.email);

    return this.ruleService.fork(user.id, forkRuleDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update rule' })
  @UseGuards(JwtAuthGuard)
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateRuleDto: UpdateRuleDto,
  ): Promise<UpdateResult> {
    const user = await this.userService.findOneByEmail(req.user.email);

    const rule = await this.ruleService.findOneById(id);

    if (rule.authorId !== user.id) {
      throw new ForbiddenException();
    }

    return this.ruleService.update(id, updateRuleDto);
  }
}
