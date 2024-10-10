import {
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
import { RuleBlock } from '../../database/entity/rule-block.entity';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateRuleBlockDto, FindAllRuleBlockDto } from './dto';
import { RuleBlockService } from './rule-block.service';
import { UserService } from '../user/user.service';

@ApiTags('rule')
@Controller('api/v1/rule/block')
export class RuleBlockController {
  constructor(
    private readonly ruleBlockService: RuleBlockService,
    private readonly userService: UserService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get RuleBlock by authorId' })
  async findAll(
    @Query() query: FindAllRuleBlockDto,
  ): Promise<{ data: RuleBlock[]; total: number }> {
    const { page, limit, hash, type, authorId, ids } = query;

    if (limit > 100) {
      // limit cannot exceed 100
      throw new ForbiddenException();
    }
    return await this.ruleBlockService.findAll({
      page,
      limit,
      hash,
      type,
      authorId,
      ids,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get RuleBlock by id' })
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string): Promise<RuleBlock> {
    return this.ruleBlockService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a RuleBlock' })
  @UseGuards(JwtAuthGuard)
  async create(
    @Req() req,
    @Body() createRuleBlockDto: CreateRuleBlockDto,
  ): Promise<RuleBlock> {
    const user = await this.userService.findOneByEmail(req.user.email);

    return this.ruleBlockService.create(user.id, createRuleBlockDto);
  }
}
