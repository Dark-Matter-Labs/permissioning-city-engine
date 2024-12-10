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
  FindAllSpaceDto,
  FindSpaceAvailabilityDto,
  ReportSpaceIssueDto,
  ResolveSpaceIssueDto,
  SetSpaceImageDto,
  UpdateSpaceDto,
  VolunteerSpaceIssueResolveDto,
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
  SpaceHistoryType,
  SpaceImageType,
  UserNotificationTarget,
  UserNotificationTemplateName,
  UserNotificationType,
} from 'src/lib/type';
import { RuleService } from '../rule/rule.service';
import { SpaceEventService } from '../space-event/space-event.service';
import { getAvailabilityIntervals } from '../../lib/util';
import { TopicService } from '../topic/topic.service';
import { SpaceHistoryService } from '../space-history/space-history.service';
import { UserNotificationService } from '../user-notification/user-notification.service';
import { SpacePermissionerService } from '../space-permissioner/space-permissioner.service';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import abbrTimezone from 'dayjs-abbr-timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(abbrTimezone);

@ApiTags('space')
@Controller('api/v1/space')
export class SpaceController {
  constructor(
    private readonly spaceService: SpaceService,
    private readonly userService: UserService,
    private readonly userNotificationService: UserNotificationService,
    private readonly ruleService: RuleService,
    private readonly topicService: TopicService,
    private readonly spaceEventService: SpaceEventService,
    private readonly spaceImageService: SpaceImageService,
    private readonly spaceHistoryService: SpaceHistoryService,
    private readonly spacePermissionerService: SpacePermissionerService,
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
  findAll(
    @Query() query: FindAllSpaceDto,
  ): Promise<{ data: Space[]; total: number }> {
    return this.spaceService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get space by id' })
  findOneById(@Param('id') id: string): Promise<Space> {
    return this.spaceService.findOneById(id, {
      relations: ['spaceImages', 'spaceTopics.topic'],
    });
  }

  @Get(':id/availability')
  @ApiOperation({ summary: 'Get space availability by id' })
  async findAvailabilityById(
    @Param('id') id: string,
    @Query() query: FindSpaceAvailabilityDto,
  ): Promise<{ data: SpaceAvailability[] }> {
    let { startDate, endDate } = query;
    const space = await this.spaceService.findOneById(id);

    if (!space) {
      throw new BadRequestException(`There is no space with id: ${id}`);
    }

    if (!startDate) {
      // startDate = new Date().toISOString();
      startDate = dayjs().tz(space.timezone).toISOString();
    }

    if (!endDate) {
      endDate = dayjs().tz(space.timezone).add(1, 'month').toISOString();
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
      data: getAvailabilityIntervals({
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        unit: spaceAvailabilityUnit,
        buffer: spaceAvailabilityBuffer,
        availabilities: spaceAvailabilities,
        unavailableRanges: reservedTimeRanges,
        timezone: space.timezone,
      }),
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: CreateSpaceDto })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'images', maxCount: 5 }], {
      fileFilter(req, file, cb) {
        if (
          [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/heic',
          ].includes(file.mimetype) === false
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
    let images = [];
    if (uploadedFiles) {
      images = uploadedFiles.images;
    }
    const maxImageCount = 5;
    const user = await this.userService.findOneByEmail(req.user.email);
    const space = await this.spaceService.create(user.id, createSpaceDto);

    if (images.length > 5) {
      throw new BadRequestException(
        `Cannot have more than ${maxImageCount} images`,
      );
    }

    images?.map(async (s3File) => {
      try {
        await this.spaceImageService.create({
          id: s3File.key.split('_')[0],
          spaceId: space.id,
          link: s3File.location,
          type: SpaceImageType.list,
        });
      } catch (error) {
        this.logger.error('Failed to create spaceImage', error);
      }
    });

    try {
      await this.spaceHistoryService.create({
        spaceId: space.id,
        ruleId: space.ruleId,
        isPublic: true,
        type: SpaceHistoryType.create,
      });
    } catch (error) {
      this.logger.error(`Failed to log space history`, error);
    }

    try {
      await this.userNotificationService.create({
        userId: user.id,
        target: UserNotificationTarget.spaceOwner,
        type: UserNotificationType.external,
        templateName: UserNotificationTemplateName.spaceCreated,
        params: {
          spaceId: space.id,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to notify user`, error);
    }

    return space;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: UpdateSpaceDto })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'images', maxCount: 5 }], {
      fileFilter(req, file, cb) {
        if (
          [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/heic',
            'image/webp',
          ].includes(file.mimetype) === false
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
    let images = [];
    if (uploadedFiles) {
      images = uploadedFiles.images;
    }
    const maxImageCount = 5;
    const user = await this.userService.findOneByEmail(req.user.email);
    const space = await this.spaceService.findOneById(id, {
      relations: ['spaceImages'],
    });

    if (space.ownerId !== user.id) {
      throw new ForbiddenException();
    }

    if (
      space.spaceImages.filter((item) => item.type === SpaceImageType.list)
        .length === 5
    ) {
      throw new BadRequestException(
        `Cannot have more than ${maxImageCount} images`,
      );
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

    const updateResult = await this.spaceService.update(id, updateSpaceDto);

    try {
      await this.spaceHistoryService.create({
        spaceId: space.id,
        ruleId: space.ruleId,
        isPublic: true,
        type: SpaceHistoryType.update,
        // TODO. translate using user.country
        details: `${Object.keys(updateSpaceDto).join(', ')} were updated by ${user.name}`,
      });
    } catch (error) {
      this.logger.error(`Failed to log space history`, error);
    }

    try {
      await this.userNotificationService.create({
        userId: user.id,
        target: UserNotificationTarget.spaceOwner,
        type: UserNotificationType.external,
        templateName: UserNotificationTemplateName.spaceUpdated,
        params: {
          spaceId: space.id,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to notify user`, error);
    }

    return updateResult;
  }

  @Post(':id/image/:type')
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: SetSpaceImageDto })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'images', maxCount: 1 }], {
      fileFilter(req, file, cb) {
        if (
          [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/heic',
            'image/webp',
          ].includes(file.mimetype) === false
        ) {
          cb(new BadRequestException('file must be an image'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Set space image' })
  async setImage(
    @Req() req,
    @Param('id') id: string,
    @Param('type') type: SpaceImageType,
    @UploadedFiles() uploadedFiles: { images: Express.MulterS3.File[] },
  ) {
    let images = [];
    if (uploadedFiles) {
      images = uploadedFiles.images;
    }
    const maxImageCount = 5;

    if (images.length > 1) {
      throw new BadRequestException('Only 1 image is allowed');
    }

    if (
      [
        SpaceImageType.list,
        SpaceImageType.cover,
        SpaceImageType.thumbnail,
      ].includes(type) === false
    ) {
      throw new BadRequestException(`type ${type} is not allowed`);
    }

    const user = await this.userService.findOneByEmail(req.user.email);
    const space = await this.spaceService.findOneById(id, {
      relations: ['spaceImages'],
    });

    if (space.ownerId !== user.id) {
      throw new ForbiddenException();
    }

    if (
      space.spaceImages.filter((item) => item.type === SpaceImageType.list)
        .length === 5
    ) {
      throw new BadRequestException(
        `Cannot have more than ${maxImageCount} images`,
      );
    }

    const image = images[0];

    try {
      await this.spaceImageService.create({
        id: image.key.split('_')[0],
        spaceId: space.id,
        link: image.location,
        type,
      });
    } catch (error) {
      this.logger.error('Failed to create spaceImage', error);
    }
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
    const spacePermissioners =
      await this.spacePermissionerService.findAllBySpaceId(
        id,
        { isActive: true },
        { isPagination: false },
      );
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

    const result = await this.spaceService.addTopic(id, topicId);

    try {
      await this.spaceHistoryService.create({
        spaceId: space.id,
        ruleId: space.ruleId,
        isPublic: true,
        type: SpaceHistoryType.update,
        // TODO. translate using user.country
        details: `Topic ${topic.name} was added by ${user.name}`,
      });
    } catch (error) {
      this.logger.error(`Failed to log space history`, error);
    }

    spacePermissioners?.data?.forEach(async (spacePermissioner) => {
      try {
        await this.userNotificationService.create({
          userId: spacePermissioner.userId,
          target: UserNotificationTarget.permissioner,
          type: UserNotificationType.internal,
          templateName: UserNotificationTemplateName.spaceUpdated,
          params: {
            spaceId: space.id,
          },
        });
      } catch (error) {
        this.logger.error(`Failed to notify user`, error);
      }
    });

    return result;
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
    const spacePermissioners =
      await this.spacePermissionerService.findAllBySpaceId(
        id,
        { isActive: true },
        { isPagination: false },
      );

    if (space.ownerId !== user.id) {
      throw new ForbiddenException();
    }

    if (!topic) {
      throw new BadRequestException(`There is no topic with id: ${topicId}`);
    }

    const result = await this.spaceService.removeTopic(id, topicId);

    try {
      await this.spaceHistoryService.create({
        spaceId: space.id,
        ruleId: space.ruleId,
        isPublic: true,
        type: SpaceHistoryType.update,
        // TODO. translate using user.country
        details: `Topic ${topic.name} was removed by ${user.name}`,
      });
    } catch (error) {
      this.logger.error(`Failed to log space history`, error);
    }

    spacePermissioners?.data?.forEach(async (spacePermissioner) => {
      try {
        await this.userNotificationService.create({
          userId: spacePermissioner.userId,
          target: UserNotificationTarget.permissioner,
          type: UserNotificationType.internal,
          templateName: UserNotificationTemplateName.spaceUpdated,
          params: {
            spaceId: space.id,
          },
        });
      } catch (error) {
        this.logger.error(`Failed to notify user`, error);
      }
    });

    return result;
  }

  @Post(':id/issue/report')
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: ReportSpaceIssueDto })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'image', maxCount: 1 }], {
      fileFilter(req, file, cb) {
        if (
          [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/heic',
            'image/webp',
          ].includes(file.mimetype) === false
        ) {
          cb(new BadRequestException('file must be an image'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Report a space issue' })
  async reportIssue(
    @Req() req,
    @Param('id') id: string,
    @Body() reportSpaceIssueDto: ReportSpaceIssueDto,
    @UploadedFiles() uploadedFiles: { image: Express.MulterS3.File[] },
  ) {
    let images: Express.MulterS3.File[] = [];

    if (uploadedFiles) {
      images = uploadedFiles.image;
    }

    if (images.length > 1) {
      throw new BadRequestException('Only 1 image is allowed');
    }

    const user = await this.userService.findOneByEmail(req.user.email);
    const space = await this.spaceService.findOneById(id);
    const spacePermissioners =
      await this.spacePermissionerService.findAllBySpaceId(
        id,
        { isActive: true },
        { isPagination: false },
      );
    const result = await this.spaceService.reportIssue(
      id,
      user.id,
      reportSpaceIssueDto,
      images[0].location,
    );

    spacePermissioners?.data?.forEach(async (spacePermissioner) => {
      try {
        await this.userNotificationService.create({
          userId: spacePermissioner.userId,
          target: UserNotificationTarget.permissioner,
          type: UserNotificationType.external,
          templateName: UserNotificationTemplateName.spaceIssueRaised,
          params: {
            spaceId: space.id,
            spaceHistory: result,
          },
        });
      } catch (error) {
        this.logger.error(`Failed to notify user`, error);
      }
    });

    return result;
  }

  @Post(':id/issue/volunteer')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Volunteer to resolve a space issue' })
  async volunteerIssueResolve(
    @Req() req,
    @Param('id') id: string,
    @Body() volunteerSpaceIssueResolveDto: VolunteerSpaceIssueResolveDto,
  ) {
    const user = await this.userService.findOneByEmail(req.user.email);
    const space = await this.spaceService.findOneById(id);
    const spacePermissioners =
      await this.spacePermissionerService.findAllBySpaceId(
        id,
        { isActive: true },
        { isPagination: false },
      );

    const result = await this.spaceService.volunteerIssueResolve(
      id,
      user.id,
      volunteerSpaceIssueResolveDto,
    );

    spacePermissioners?.data?.forEach(async (spacePermissioner) => {
      try {
        await this.userNotificationService.create({
          userId: spacePermissioner.userId,
          target: UserNotificationTarget.permissioner,
          type: UserNotificationType.external,
          templateName: UserNotificationTemplateName.spaceIssueResolved,
          params: {
            spaceId: space.id,
            spaceHistory: result,
          },
        });
      } catch (error) {
        this.logger.error(`Failed to notify user`, error);
      }
    });

    return result;
  }

  @Post(':id/issue/resolve')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Resolve a space issue' })
  async resolveIssue(
    @Req() req,
    @Param('id') id: string,
    @Body() resolveSpaceIssueDto: ResolveSpaceIssueDto,
  ) {
    const user = await this.userService.findOneByEmail(req.user.email);
    const space = await this.spaceService.findOneById(id);
    const spacePermissioners =
      await this.spacePermissionerService.findAllBySpaceId(
        id,
        { isActive: true },
        { isPagination: false },
      );

    const result = await this.spaceService.resolveIssue(
      id,
      user.id,
      resolveSpaceIssueDto,
    );

    spacePermissioners?.data?.forEach(async (spacePermissioner) => {
      try {
        await this.userNotificationService.create({
          userId: spacePermissioner.userId,
          target: UserNotificationTarget.permissioner,
          type: UserNotificationType.external,
          templateName: UserNotificationTemplateName.spaceIssueResolved,
          params: {
            spaceId: space.id,
            spaceHistory: result,
          },
        });
      } catch (error) {
        this.logger.error(`Failed to notify user`, error);
      }
    });

    return result;
  }
}
