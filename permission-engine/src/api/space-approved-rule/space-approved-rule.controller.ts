import { Controller, Get, Query } from '@nestjs/common';
import { FindAllSpaceApprovedRuleDto } from './dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Logger } from 'src/lib/logger/logger.service';
import { SpaceApprovedRuleService } from './space-approved-rule.service';

@ApiTags('space')
@Controller('api/v1/space/approved-rule')
export class SpaceApprovedRuleController {
  constructor(
    private readonly spaceApprovedRuleService: SpaceApprovedRuleService,
    private readonly logger: Logger,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all SpaceApprovedRules' })
  findAll(@Query() query: FindAllSpaceApprovedRuleDto) {
    const { page, limit, spaceId, ruleId, isActive } = query;

    return this.spaceApprovedRuleService.findAll({
      page,
      limit,
      spaceId,
      ruleId,
      isActive,
    });
  }
}
