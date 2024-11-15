import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Put,
  ForbiddenException,
  BadRequestException,
  UseInterceptors,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { SpaceService } from './space.service';
import { Space } from '../../database/entity/space.entity';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateSpaceDto } from './dto/create-space.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import {
  FindAllMatchedRuleDto,
  FindSpaceAvailabilityDto,
  ReportSpaceIssueDto,
  ResolveSpaceIssueDto,
  UpdateSpaceDto,
} from './dto';
import { UserService } from '../user/user.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SpaceImageService } from '../space-image/space-image.service';
import { Logger } from 'src/lib/logger/logger.service';
import {
  RuleBlockContentDivider,
  RuleBlockType,
  SpaceAvailability,
  SpaceEventStatus,
} from 'src/lib/type';
import { RuleService } from '../rule/rule.service';
import { SpaceEventService } from '../space-event/space-event.service';
import { getTimeIntervals } from '../../lib/util';
import { TopicService } from '../topic/topic.service';

@ApiTags('space')
@Controller('api/v1/space')
export class SpaceController {
  constructor(
    private readonly spaceService: SpaceService,
    private readonly userService: UserService,
    private readonly ruleService: RuleService,
    private readonly topicService: TopicService,
    private readonly spaceEventService: SpaceEventService,
    private readonly spaceImageService: SpaceImageService,
    private readonly logger: Logger,
  ) {}

  @Get('matched-rule')
  @ApiOperation({
    summary: 'Get matching rule templates by spaceId and condition',
  })
  findAllMatched(@Query() query: FindAllMatchedRuleDto) {
    const { page, limit, spaceId, spaceEventExceptions } = query;

    return this.ruleService.findAllMatched({
      page,
      limit,
      spaceId,
      spaceEventExceptions,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all spaces' })
  findAll(): Promise<Space[]> {
    return this.spaceService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get space by id' })
  findOneById(@Param('id') id: string): Promise<Space> {
    return this.spaceService.findOneById(id, {
      relations: ['spaceImages', 'spaceTopics'],
    });
  }

  @Get(':id/availability')
  @ApiOperation({ summary: 'Get space availability by id' })
  async findAvailabilityById(
    @Param('id') id: string,
    @Query() query: FindSpaceAvailabilityDto,
  ): Promise<{ data: SpaceAvailability[] }> {
    const { startDate, endDate } = query;
    const space = await this.spaceService.findOneById(id);
    if (!space) {
      throw new BadRequestException(`There is no space with id: ${id}`);
    }
    const spaceRule = await this.ruleService.findOneById(space.ruleId);
    const spaceEvents =
      (
        await this.spaceEventService.findAll(
          {
            spaceId: id,
            startsAfter: new Date(startDate),
            endsBefore: new Date(endDate),
            statuses: [
              // incomplete event statuses
              SpaceEventStatus.pending,
              SpaceEventStatus.permissionRequested,
              SpaceEventStatus.permissionGranted,
              SpaceEventStatus.running,
              SpaceEventStatus.closed,
            ],
          },
          { isPagination: false },
        )
      )?.data ?? [];

    const spaceEventRules =
      (
        await this.ruleService.findAll(
          { ids: spaceEvents.map((item) => item.ruleId) },
          {
            isPagination: false,
            isPublicOnly: false,
          },
        )
      )?.data ?? [];

    const spaceAvailabilityBlock = spaceRule.ruleBlocks.find(
      (item) => item.type === RuleBlockType.spaceAvailability,
    );
    const spaceAvailabilityUnitBlock = spaceRule.ruleBlocks.find(
      (item) => item.type === RuleBlockType.spaceAvailabilityUnit,
    );
    const spaceAvailabilityBufferBlock = spaceRule.ruleBlocks.find(
      (item) => item.type === RuleBlockType.spaceAvailabilityBuffer,
    );
    const spaceAvailabilities = spaceAvailabilityBlock.content
      .trim()
      .toLowerCase()
      .split(RuleBlockContentDivider.array)
      .filter((item) => item != null && item !== '');
    const spaceAvailabilityUnit = spaceAvailabilityUnitBlock.content;
    const spaceAvailabilityBuffer = spaceAvailabilityBufferBlock.content;

    const reservedTimeRanges =
      spaceEvents?.map((spaceEvent) => {
        const spaceEventRule = spaceEventRules?.find(
          (item) => item.id === spaceEvent.ruleId,
        );
        const bufferExceptionRuleBlock = spaceEventRule?.ruleBlocks?.find(
          (item) =>
            item.type === RuleBlockType.spaceEventException &&
            item.content.startsWith(spaceAvailabilityBufferBlock.hash),
        );
        return {
          startTime: spaceEvent.startsAt,
          endTime: spaceEvent.endsAt,
          buffer:
            bufferExceptionRuleBlock?.content?.split(
              RuleBlockContentDivider.type,
            )?.[1] ?? spaceAvailabilityBuffer,
        };
      }) ?? [];

    return {
      data: getTimeIntervals(
        new Date(startDate),
        new Date(endDate),
        spaceAvailabilityUnit,
        spaceAvailabilities,
        reservedTimeRanges,
      ),
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: CreateSpaceDto })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'images', maxCount: 5 }], {
      fileFilter(req, file, cb) {
        if (
          ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(
            file.mimetype,
          ) === false
        ) {
          cb(new BadRequestException('file must be an image'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a space' })
  async create(
    @Req() req,
    @UploadedFiles() uploadedFiles: { images: Express.MulterS3.File[] },
    @Body() createSpaceDto: CreateSpaceDto,
  ): Promise<Space> {
    const { images } = uploadedFiles;
    const user = await this.userService.findOneByEmail(req.user.email);
    const space = await this.spaceService.create(user.id, createSpaceDto);

    images?.map(async (s3File) => {
      try {
        await this.spaceImageService.create({
          id: s3File.key.split('_')[0],
          spaceId: space.id,
          link: s3File.location,
        });
      } catch (error) {
        this.logger.error('Failed to create spaceImage', error);
      }
    });

    return space;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: UpdateSpaceDto })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'images', maxCount: 5 }], {
      fileFilter(req, file, cb) {
        if (
          ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(
            file.mimetype,
          ) === false
        ) {
          cb(new BadRequestException('file must be an image'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update a space' })
  async update(
    @Req() req,
    @Param('id') id: string,
    @UploadedFiles() uploadedFiles: { images: Express.MulterS3.File[] },
    @Body() updateSpaceDto: UpdateSpaceDto,
  ) {
    const { images } = uploadedFiles;
    const user = await this.userService.findOneByEmail(req.user.email);
    const space = await this.spaceService.findOneById(id);

    if (space.ownerId !== user.id) {
      throw new ForbiddenException();
    }

    images?.map(async (s3File) => {
      try {
        await this.spaceImageService.create({
          id: s3File.key.split('_')[0],
          spaceId: space.id,
          link: s3File.location,
        });
      } catch (error) {
        this.logger.error('Failed to create spaceImage', error);
      }
    });

    return this.spaceService.update(id, updateSpaceDto);
  }

  @Put(':id/topic/add/:topicId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add a topic to space' })
  async addTopic(
    @Req() req,
    @Param('id') id: string,
    @Param('topicId') topicId: string,
  ) {
    const user = await this.userService.findOneByEmail(req.user.email);
    const space = await this.spaceService.findOneById(id);
    const topic = await this.topicService.findOneById(id);

    if (space.ownerId !== user.id) {
      throw new ForbiddenException();
    }

    if (!topic) {
      throw new BadRequestException(`There is no topic with id: ${topicId}`);
    }

    const isValidTopic =
      ['common', space.country].includes(topic.country) &&
      ['common', space.region].includes(topic.region) &&
      ['common', space.city].includes(topic.city);

    if (isValidTopic === false) {
      throw new BadRequestException(
        `This topic is not supported for the space`,
      );
    }

    return this.spaceService.addTopic(id, topicId);
  }

  @Put(':id/topic/remove/:topicId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove a topic from space' })
  async removeTopic(
    @Req() req,
    @Param('id') id: string,
    @Param('topicId') topicId: string,
  ) {
    const user = await this.userService.findOneByEmail(req.user.email);
    const space = await this.spaceService.findOneById(id);
    const topic = await this.topicService.findOneById(id);

    if (space.ownerId !== user.id) {
      throw new ForbiddenException();
    }

    if (!topic) {
      throw new BadRequestException(`There is no topic with id: ${topicId}`);
    }

    return this.spaceService.removeTopic(id, topicId);
  }

  @Post(':id/issue/report')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove a topic from space' })
  async reportIssue(
    @Req() req,
    @Param('id') id: string,
    @Body() reportSpaceIssueDto: ReportSpaceIssueDto,
  ) {
    const user = await this.userService.findOneByEmail(req.user.email);

    return this.spaceService.reportIssue(id, user.id, reportSpaceIssueDto);
  }

  @Post(':id/issue/resolve')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove a topic from space' })
  async resolveIssue(
    @Req() req,
    @Param('id') id: string,
    @Body() resolveSpaceIssueDto: ResolveSpaceIssueDto,
  ) {
    const user = await this.userService.findOneByEmail(req.user.email);

    return this.spaceService.resolveIssue(id, user.id, resolveSpaceIssueDto);
  }
}
