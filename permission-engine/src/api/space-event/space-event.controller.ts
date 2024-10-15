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
  CompleteSpaceEventDto,
} from './dto';
import { SpaceEventService } from './space-event.service';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserService } from '../user/user.service';
import { SpaceService } from '../space/space.service';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { S3Service } from 'src/lib/s3/s3.service';
import { SpaceEventImageService } from '../space-event-image/space-event-image.service';
import { Logger } from 'src/lib/logger/logger.service';
import { Express } from 'express';

@ApiTags('event')
@Controller('api/v1/event')
export class SpaceEventController {
  constructor(
    private readonly spaceEventService: SpaceEventService,
    private readonly spaceEventImageService: SpaceEventImageService,
    private readonly spaceService: SpaceService,
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
      externalServiceId,
      permissionRequestId,
      statuses,
      topicIds,
      startsAfter,
      name,
    } = query;

    if (limit > 100) {
      // limit cannot exceed 100
      throw new ForbiddenException();
    }

    return this.spaceEventService.findAll({
      page,
      limit,
      organizerId,
      spaceId,
      externalServiceId,
      permissionRequestId,
      statuses,
      topicIds,
      startsAfter,
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
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'SpaceEvent name',
        },
        organizerId: {
          type: 'string',
          description: 'SpaceEvent organizerId in uuid',
        },
        ruleId: {
          type: 'string',
          nullable: true,
          description: 'SpaceEvent ruleId in uuid',
        },
        spaceId: {
          type: 'string',
          nullable: true,
          description: 'SpaceEvent spaceId in uuid',
        },
        externalServiceId: {
          type: 'string',
          nullable: true,
          description: 'SpaceEvent externalServiceId in uuid',
        },
        details: {
          type: 'string',
          nullable: true,
          description: 'SpaceEvent details',
        },
        link: {
          type: 'string',
          nullable: true,
          description: 'SpaceEvent link for registration or purchase tickets',
        },
        duration: {
          type: 'string',
          description: 'SpaceEvent duration in {number}{d|w|M|y|h|m|s} format',
        },
        startsAt: {
          type: 'string',
          format: 'date-time',
          description: 'SpaceEvent start date',
        },
        images: {
          description: 'SpaceEvent images in jpeg|jpg|png|gif',
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
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
    const user = await this.userService.findOneByEmail(req.user.email);

    const spaceEvent = await this.spaceEventService.create(
      user.id,
      createSpaceEventDto,
    );

    const { images } = uploadedFiles;

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
  @ApiOperation({ summary: 'Update SpaceEvent' })
  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtAuthGuard)
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

    const removeSpaceEventImageIds =
      updateSpaceEventDto.removeSpaceEventImageIds ?? [];
    const spaceEventImages = spaceEvent.spaceEventImages ?? [];

    if (
      spaceEventImages.length -
        removeSpaceEventImageIds.length +
        images.length >
      5
    ) {
      throw new BadRequestException('Up to 5 images are allowed.');
    }

    removeSpaceEventImageIds.map(async (id) => {
      await this.spaceEventImageService.remove(id);
    });

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

    return this.spaceEventService.update(id, updateSpaceEventDto);
  }

  @Post(':id/run')
  @ApiOperation({ summary: 'Run SpaceEvent' })
  @UseGuards(JwtAuthGuard)
  async run(@Req() req, @Param('id') id: string) {
    const user = await this.userService.findOneByEmail(req.user.email);
    const spaceEvent = await this.spaceEventService.findOneById(id);

    if (spaceEvent.organizerId !== user.id) {
      throw new ForbiddenException();
    }
    // TODO. create SpaceHistory record

    return this.spaceEventService.run(id);
  }

  @Get(':id/complete')
  @ApiOperation({ summary: 'Get post event check lists of SpaceEvent' })
  @UseGuards(JwtAuthGuard)
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
  @ApiOperation({ summary: 'Complete SpaceEvent' })
  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('images', {
      limits: {
        files: 5,
        fileSize: 1024 * 1024 * 10, // 10MB
      },
      fileFilter: (req, file, cb) => {
        if (
          ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes[
            file.mimetype
          ] === false
        ) {
          cb(new Error('Invalid file type'), false);
        }
      },
    }),
  )
  async complete(
    @Req() req,
    @Param('id') id: string,
    @Body() completeSpaceEventDto: CompleteSpaceEventDto,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    const user = await this.userService.findOneByEmail(req.user.email);
    const spaceEvent = await this.spaceEventService.findOneById(id);

    if (spaceEvent.organizerId !== user.id) {
      throw new ForbiddenException();
    }

    images?.map(async (file) => {
      const fileUrl = await this.s3Service.uploadFile(file);

      await this.spaceEventImageService.create({
        spaceEventId: spaceEvent.id,
        link: fileUrl,
      });
    });

    // TODO. create SpaceHistory record with completeSpaceEventDto data
    // TODO. if there is completeSpaceEventDto.details: issue reported to space -> recored as `issue_report` type to SpaceHistory -> notification sent to PG

    return this.spaceEventService.complete(id);
  }
}
