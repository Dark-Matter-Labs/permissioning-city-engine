import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ForbiddenException,
  Query,
} from '@nestjs/common';
import { RuleService } from './rule.service';
import { Rule } from '../../database/entity/rule.entity';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateRuleDto } from './dto/create-rule.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ForkRuleDto } from './dto';
import { UserService } from '../user/user.service';
import { RuleTarget } from 'src/lib/type';

@ApiTags('rule')
@Controller('api/v1/rule')
export class RuleController {
  constructor(
    private readonly ruleService: RuleService,
    private readonly userService: UserService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all rules' })
  findAll(
    @Query('page') page: number | null,
    @Query('limit') limit: number | null,
    @Query('target') target: RuleTarget | null,
    @Query('authorId') authorId: string | null,
    @Query('parentRuleId') parentRuleId: string | null,
    @Query('hash') hash: string | null,
  ): Promise<{ data: Rule[]; total: number }> {
    if (limit > 100) {
      // limit cannot exceed 100
      throw new ForbiddenException();
    }

    return this.ruleService.findAll(
      page,
      limit,
      target,
      authorId,
      parentRuleId,
      hash,
    );
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
  fork(@Body() forkRuleDto: ForkRuleDto): Promise<Rule> {
    return this.ruleService.fork(forkRuleDto);
  }
}
