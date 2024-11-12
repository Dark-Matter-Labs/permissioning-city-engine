import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  CreateSpaceEventDto,
  UpdateSpaceEventDto,
  FindAllSpaceEventDto,
  CompleteWithIssueSpaceEventDto,
  CompleteSpaceEventDto,
  CompleteWithIssueResolvedSpaceEventDto,
} from './dto';
import { SpaceEventService } from './space-event.service';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserService } from '../user/user.service';
import { SpaceService } from '../space/space.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { S3Service } from 'src/lib/s3/s3.service';
import { SpaceEventImageService } from '../space-event-image/space-event-image.service';
import { Logger } from 'src/lib/logger/logger.service';
import { Express } from 'express';
import { SpacePermissionerService } from '../space-permissioner/space-permissioner.service';
import { SpaceEventStatus } from 'src/lib/type';

@ApiTags('event')
@Controller('api/v1/event')
export class SpaceEventController {
  constructor(
    private readonly spaceEventService: SpaceEventService,
    private readonly spaceEventImageService: SpaceEventImageService,
    private readonly spaceService: SpaceService,
    private readonly spacePermissionerService: SpacePermissionerService,
    private readonly userService: UserService,
    private readonly s3Service: S3Service,
    private readonly logger: Logger,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all SpaceEvents' })
  findAll(@Query() query: FindAllSpaceEventDto) {
    const {
      page,
      limit,
      organizerId,
      spaceId,
      ruleId,
      externalServiceId,
      permissionRequestId,
      statuses,
      topicIds,
      startsAfter,
      endsBefore,
      name,
    } = query;

    return this.spaceEventService.findAll({
      page,
      limit,
      organizerId,
      spaceId,
      ruleId,
      externalServiceId,
      permissionRequestId,
      statuses,
      topicIds,
      startsAfter,
      endsBefore,
      name,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a SpaceEvent' })
  findOne(@Param('id') id: string) {
    return this.spaceEventService.findOneById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: CreateSpaceEventDto })
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
  @ApiOperation({ summary: 'Create SpaceEvent' })
  async create(
    @Req() req,
    @UploadedFiles() uploadedFiles: { images: Express.MulterS3.File[] },
    @Body() createSpaceEventDto: CreateSpaceEventDto,
  ) {
    const { images } = uploadedFiles;
    const user = await this.userService.findOneByEmail(req.user.email);
    const spaceEvent = await this.spaceEventService.create(
      user.id,
      createSpaceEventDto,
    );

    images?.map(async (s3File) => {
      try {
        await this.spaceEventImageService.create({
          id: s3File.key.split('_')[0],
          spaceEventId: spaceEvent.id,
          link: s3File.location,
        });
      } catch (error) {
        this.logger.error('Failed to create spaceEventImage', error);
      }
    });

    return spaceEvent;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update SpaceEvent' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateSpaceEventDto })
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
  async update(
    @Req() req,
    @Param('id') id: string,
    @UploadedFiles() uploadedFiles: { images: Express.MulterS3.File[] },
    @Body() updateSpaceEventDto: UpdateSpaceEventDto,
  ) {
    const user = await this.userService.findOneByEmail(req.user.email);
    const spaceEvent = await this.spaceEventService.findOneById(id);
    const { images } = uploadedFiles;

    if (spaceEvent.organizerId !== user.id) {
      throw new ForbiddenException();
    }

    const result = {
      removedSpaceEventImageIds: [],
      addedSpaceEventImageIds: [],
      spaceEventUpdate: null,
    };
    const removeSpaceEventImageIds =
      updateSpaceEventDto.removeSpaceEventImageIds ?? [];
    const spaceEventImages = spaceEvent.spaceEventImages ?? [];
    const newImages = images ?? [];

    if (
      spaceEventImages.length -
        removeSpaceEventImageIds.length +
        newImages.length >
      5
    ) {
      throw new BadRequestException('Up to 5 images are allowed.');
    }

    for (const spaceEventImageId of removeSpaceEventImageIds) {
      await this.spaceEventImageService.remove(spaceEventImageId).then(() => {
        result.removedSpaceEventImageIds.push(spaceEventImageId);
      });
    }

    for (const s3File of newImages) {
      try {
        const id = s3File.key.split('_')[0];
        const spaceEventImage = await this.spaceEventImageService.create({
          id,
          spaceEventId: spaceEvent.id,
          link: s3File.location,
        });

        result.addedSpaceEventImageIds.push(spaceEventImage.id);
      } catch (error) {
        this.logger.error('Failed to create spaceEventImage', error);
      }
    }

    if (
      updateSpaceEventDto.name != null ||
      updateSpaceEventDto.ruleId != null ||
      updateSpaceEventDto.permissionRequestId != null ||
      updateSpaceEventDto.externalServiceId != null ||
      updateSpaceEventDto.details != null ||
      updateSpaceEventDto.link != null ||
      updateSpaceEventDto.duration != null ||
      updateSpaceEventDto.startsAt != null
    ) {
      result.spaceEventUpdate = await this.spaceEventService.update(
        id,
        updateSpaceEventDto,
      );
    }

    return result;
  }

  @Post(':id/run')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Run SpaceEvent' })
  async run(@Req() req, @Param('id') id: string) {
    const user = await this.userService.findOneByEmail(req.user.email);
    const spaceEvent = await this.spaceEventService.findOneById(id);

    if (spaceEvent.organizerId !== user.id) {
      throw new ForbiddenException();
    }
    // TODO. create SpaceHistory record

    return this.spaceEventService.updateToRunning(id);
  }

  @Get(':id/complete')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get post event check lists of SpaceEvent' })
  async findPostEventCheckRuleBlocks(@Req() req, @Param('id') id: string) {
    const user = await this.userService.findOneByEmail(req.user.email);
    const spaceEvent = await this.spaceEventService.findOneById(id);

    if (spaceEvent.organizerId !== user.id) {
      throw new ForbiddenException();
    }

    if (!spaceEvent.spaceId) {
      throw new BadRequestException();
    }

    return this.spaceService.findPostEventCheckRuleBlocks(spaceEvent.spaceId);
  }

  @Post(':id/complete')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Complete SpaceEvent' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CompleteWithIssueSpaceEventDto })
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
  async complete(
    @Req() req,
    @Param('id') id: string,
    @UploadedFiles() uploadedFiles: { images: Express.MulterS3.File[] },
    @Body() completeSpaceEventDto: CompleteSpaceEventDto,
  ) {
    const user = await this.userService.findOneByEmail(req.user.email);
    const spaceEvent = await this.spaceEventService.findOneById(id);
    const { images } = uploadedFiles;

    if (spaceEvent.organizerId !== user.id) {
      throw new ForbiddenException();
    }

    const result = {
      addedSpaceEventImageIds: [],
      spaceEventUpdate: null,
    };
    const newImages = images ?? [];
    const incompletePostEventCheckRuleBlockIds =
      completeSpaceEventDto.incompletePostEventCheckRuleBlockIds ?? [];
    const { completePostEventCheckRuleBlockIds, details } =
      completeSpaceEventDto;

    if (newImages.length > 5) {
      throw new ForbiddenException('Up to 5 images are allowed');
    }

    for (const s3File of newImages) {
      try {
        const id = s3File.key.split('_')[0];
        const spaceEventImage = await this.spaceEventImageService.create({
          id,
          spaceEventId: spaceEvent.id,
          link: s3File.location,
        });

        result.addedSpaceEventImageIds.push(spaceEventImage.id);
      } catch (error) {
        this.logger.error('Failed to create spaceEventImage', error);
      }
    }

    // TODO. create SpaceHistory record with completeSpaceEventDto data
    // TODO. if there is completeSpaceEventDto.details: issue reported to space -> recored as `issue_report` type to SpaceHistory -> notification sent to PG
    const postEventCheckList =
      await this.spaceService.findPostEventCheckRuleBlocks(spaceEvent.spaceId);

    if (
      postEventCheckList
        .map((item) => item.id)
        .sort()
        .join() !==
      [
        ...completePostEventCheckRuleBlockIds,
        ...incompletePostEventCheckRuleBlockIds,
      ]
        .sort()
        .join()
    ) {
      throw new BadRequestException('Post event check list does not match');
    }

    if (incompletePostEventCheckRuleBlockIds.length > 0) {
      if (details == null) {
        throw new BadRequestException('Please provide details');
      }
    }

    result.spaceEventUpdate = await this.spaceEventService.updateToComplete(
      id,
      completeSpaceEventDto,
    );

    return result;
  }

  @Post(':id/complete-with-issue')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Raise issue for completing SpaceEvent' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CompleteWithIssueSpaceEventDto })
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
  async completeWithIssue(
    @Req() req,
    @Param('id') id: string,
    @UploadedFiles() uploadedFiles: { images: Express.MulterS3.File[] },
    @Body() completeWithIssueSpaceEventDto: CompleteWithIssueSpaceEventDto,
  ) {
    const user = await this.userService.findOneByEmail(req.user.email);
    const spaceEvent = await this.spaceEventService.findOneById(id);
    const { images } = uploadedFiles;

    if (spaceEvent.organizerId !== user.id) {
      throw new ForbiddenException();
    }

    const result = {
      addedSpaceEventImageIds: [],
      spaceEventUpdate: null,
    };
    const newImages = images ?? [];
    const incompletePostEventCheckRuleBlockIds =
      completeWithIssueSpaceEventDto.incompletePostEventCheckRuleBlockIds ?? [];
    const completePostEventCheckRuleBlockIds =
      completeWithIssueSpaceEventDto.completePostEventCheckRuleBlockIds ?? [];
    const { details } = completeWithIssueSpaceEventDto;

    if (newImages.length > 5) {
      throw new ForbiddenException('Up to 5 images are allowed');
    }

    for (const s3File of newImages) {
      try {
        const id = s3File.key.split('_')[0];
        const spaceEventImage = await this.spaceEventImageService.create({
          id,
          spaceEventId: spaceEvent.id,
          link: s3File.location,
        });

        result.addedSpaceEventImageIds.push(spaceEventImage.id);
      } catch (error) {
        this.logger.error('Failed to create spaceEventImage', error);
      }
    }

    // TODO. create SpaceHistory record with completeWithIssueSpaceEventDto data
    // TODO. if there is completeWithIssueSpaceEventDto.details: issue reported to space -> recored as `issue_report` type to SpaceHistory -> notification sent to PG
    const postEventCheckList =
      await this.spaceService.findPostEventCheckRuleBlocks(spaceEvent.spaceId);

    if (
      postEventCheckList
        .map((item) => item.id)
        .sort()
        .join() !==
      [
        ...completePostEventCheckRuleBlockIds,
        ...incompletePostEventCheckRuleBlockIds,
      ]
        .sort()
        .join()
    ) {
      throw new BadRequestException('Post event check list does not match');
    }

    if (incompletePostEventCheckRuleBlockIds.length > 0) {
      if (details == null) {
        throw new BadRequestException('Please provide details');
      }
    }

    result.spaceEventUpdate =
      await this.spaceEventService.updateToCompleteWithIssue(
        id,
        completeWithIssueSpaceEventDto,
      );

    return result;
  }

  @Post(':id/complete-with-issue/resolve')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Raise issue for completing SpaceEvent' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CompleteWithIssueResolvedSpaceEventDto })
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
  async completeWithIssueResolved(
    @Req() req,
    @Param('id') id: string,
    @UploadedFiles() uploadedFiles: { images: Express.MulterS3.File[] },
    @Body()
    completeWithIssueResolvedSpaceEventDto: CompleteWithIssueResolvedSpaceEventDto,
  ) {
    const user = await this.userService.findOneByEmail(req.user.email);
    const spaceEvent = await this.spaceEventService.findOneById(id);
    const spacePermissioners =
      (
        await this.spacePermissionerService.findAllBySpaceId(
          spaceEvent.spaceId,
          { isActive: true },
          false,
        )
      )?.data ?? [];
    const { images } = uploadedFiles;

    if (
      [
        spaceEvent.organizerId,
        ...spacePermissioners.map((item) => item.userId),
      ].includes(user.id)
    ) {
      throw new ForbiddenException();
    }

    if (
      [SpaceEventStatus.completeWithIssue].includes(spaceEvent.status) === false
    ) {
      throw new ForbiddenException(
        `Cannot resolve issue for ${spaceEvent.status} SpaceEvent.`,
      );
    }

    const result = {
      addedSpaceEventImageIds: [],
      spaceEventUpdate: null,
    };
    const newImages = images ?? [];
    const incompletePostEventCheckRuleBlockIds =
      completeWithIssueResolvedSpaceEventDto.incompletePostEventCheckRuleBlockIds ??
      [];
    const completePostEventCheckRuleBlockIds =
      completeWithIssueResolvedSpaceEventDto.completePostEventCheckRuleBlockIds ??
      [];
    const { details } = completeWithIssueResolvedSpaceEventDto;

    if (newImages.length > 5) {
      throw new ForbiddenException('Up to 5 images are allowed');
    }

    for (const s3File of newImages) {
      try {
        const id = s3File.key.split('_')[0];
        const spaceEventImage = await this.spaceEventImageService.create({
          id,
          spaceEventId: spaceEvent.id,
          link: s3File.location,
        });

        result.addedSpaceEventImageIds.push(spaceEventImage.id);
      } catch (error) {
        this.logger.error('Failed to create spaceEventImage', error);
      }
    }

    // TODO. create SpaceHistory record with completeWithIssueResolvedSpaceEventDto data
    // TODO. if there is completeWithIssueResolvedSpaceEventDto.details: issue reported to space -> recored as `issue_report` type to SpaceHistory -> notification sent to PG
    const postEventCheckList =
      await this.spaceService.findPostEventCheckRuleBlocks(spaceEvent.spaceId);

    if (
      postEventCheckList
        .map((item) => item.id)
        .sort()
        .join() !==
      [
        ...completePostEventCheckRuleBlockIds,
        ...incompletePostEventCheckRuleBlockIds,
      ]
        .sort()
        .join()
    ) {
      throw new BadRequestException('Post event check list does not match');
    }

    if (incompletePostEventCheckRuleBlockIds.length > 0) {
      if (details == null) {
        throw new BadRequestException('Please provide details');
      }
    }

    result.spaceEventUpdate =
      await this.spaceEventService.updateToCompleteWithIssueResolved(
        id,
        completeWithIssueResolvedSpaceEventDto,
      );

    return result;
  }
}
