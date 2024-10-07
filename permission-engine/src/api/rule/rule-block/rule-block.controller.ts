import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RuleBlock } from '../../../database/entity/rule-block.entity';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateRuleBlockDto } from '../dto';
import { RuleBlockService } from './rule-block.service';

@ApiTags('rule')
@Controller('api/v1/rule/block')
export class RuleBlockController {
  constructor(private readonly ruleBlockService: RuleBlockService) {}

  @Get()
  @ApiOperation({ summary: 'Get RuleBlock by authorId' })
  @UseGuards(JwtAuthGuard)
  findByAuthorId(@Query('authorId') authorId: string): Promise<RuleBlock[]> {
    return this.ruleBlockService.findByAuthorId(authorId);
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
  create(@Body() createRuleBlockDto: CreateRuleBlockDto): Promise<RuleBlock> {
    return this.ruleBlockService.create(createRuleBlockDto);
  }
}
