import { Controller, Get, Param, Query } from '@nestjs/common';
import { TopicService } from './topic.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FindAllTopicDto } from './dto';
import { UserService } from '../user/user.service';
import { Topic } from 'src/database/entity/topic.entity';

@ApiTags('topic')
@Controller('api/v1/topic')
export class TopicController {
  constructor(
    private readonly topicService: TopicService,
    private readonly userService: UserService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all topics' })
  findAll(@Query() query: FindAllTopicDto) {
    const { page, limit, ids, names } = query;

    return this.topicService.findAll({
      page,
      limit,
      ids,
      names,
    });
  }

  @Get('space/:spaceId')
  @ApiOperation({ summary: 'Get all topics by space id' })
  findAllBySpaceId(@Param('spaceId') spaceId: string) {
    return this.topicService.findAllBySpaceId(spaceId);
  }

  @Get('event/:spaceEventId')
  @ApiOperation({ summary: 'Get all topics by event id' })
  findAllBySpaceEventId(@Param('spaceEventId') spaceEventId: string) {
    return this.topicService.findAllBySpaceEventId(spaceEventId);
  }

  @Get('Rule/:ruleId')
  @ApiOperation({ summary: 'Get all topics' })
  findAllByRuleId(@Param('ruleId') ruleId: string) {
    return this.topicService.findAllByRuleId(ruleId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get topic by id' })
  findOneById(@Param('id') id: string): Promise<Topic> {
    return this.topicService.findOneById(id);
  }

  // TODO. Decide topic management policy
  // @Post()
  // @ApiOperation({ summary: 'Create a topic' })
  // @UseGuards(JwtAuthGuard)
  // async create(
  //   @Req() req,
  //   @Body() createRuleDto: CreateTopicDto,
  // ): Promise<Topic> {
  //   const user = await this.userService.findOneByEmail(req.user.email);

  //   return this.topicService.create(user.id, createRuleDto);
  // }

  // @Put()
  // @ApiOperation({ summary: 'Update a topic' })
  // @UseGuards(JwtAuthGuard)
  // async update(
  //   @Req() req,
  //   @Param('id') id: string,
  //   @Body() updateTopicDto: UpdateTopicDto,
  // ) {
  //   const user = await this.userService.findOneByEmail(req.user.email);
  //   const topic = await this.topicService.findOneById(id);

  //   if (topic.authorId !== user.id) {
  //     throw new ForbiddenException();
  //   }

  //   return this.topicService.update(id, updateTopicDto);
  // }

  // @Put('activate')
  // @ApiOperation({ summary: 'Update a topic to active' })
  // @UseGuards(JwtAuthGuard)
  // async updateToActive(@Req() req, @Param('id') id: string) {
  //   const user = await this.userService.findOneByEmail(req.user.email);
  //   const topic = await this.topicService.findOneById(id);

  //   if (topic.authorId !== user.id) {
  //     throw new ForbiddenException();
  //   }

  //   return this.topicService.updateToActive(id);
  // }

  // @Put('inactivate')
  // @ApiOperation({ summary: 'Update a topic to inActive' })
  // @UseGuards(JwtAuthGuard)
  // async updateToInActive(@Req() req, @Param('id') id: string) {
  //   const user = await this.userService.findOneByEmail(req.user.email);
  //   const topic = await this.topicService.findOneById(id);

  //   if (topic.authorId !== user.id) {
  //     throw new ForbiddenException();
  //   }

  //   return this.topicService.updateToInActive(id);
  // }
}
