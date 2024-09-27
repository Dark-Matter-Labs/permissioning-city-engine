import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { RuleService } from './rule.service';
import { Rule } from '../../database/entity/rule.entity';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateRuleDto } from './dto/create-rule.dto';

@ApiTags('rule')
@Controller('api/v1/rule')
export class RuleController {
  constructor(private readonly ruleService: RuleService) {}

  @Get()
  @ApiOperation({ summary: 'Get all rules' })
  findAll(): Promise<Rule[]> {
    return this.ruleService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get space by id' })
  findOneById(@Param('id') id: string): Promise<Rule> {
    return this.ruleService.findOneById(id);
  }

  @Get('name/:name')
  @ApiOperation({ summary: 'Get space by name' })
  findByName(@Param('id') id: string): Promise<Rule> {
    return this.ruleService.findOneByName(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a space' })
  create(@Body() createRuleDto: CreateRuleDto): Promise<Rule> {
    return this.ruleService.create(createRuleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a space' })
  remove(@Param('id') id: string): Promise<void> {
    return this.ruleService.remove(id);
  }
}
