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
import { FindSpaceAvailabilityDto, UpdateSpaceDto } from './dto';
import { UserService } from '../user/user.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SpaceImageService } from '../space-image/space-image.service';
import { Logger } from 'src/lib/logger/logger.service';
import {
  RuleBlockType,
  SpaceAvailability,
  SpaceAvailabilityUnit,
} from 'src/lib/type';
import { RuleService } from '../rule/rule.service';
import { SpaceEventService } from '../space-event/space-event.service';
import { getTimeIntervals } from '../../lib/util/util';

@ApiTags('space')
@Controller('api/v1/space')
export class SpaceController {
  constructor(
    private readonly spaceService: SpaceService,
    private readonly userService: UserService,
    private readonly ruleService: RuleService,
    private readonly spaceEventService: SpaceEventService,
    private readonly spaceImageService: SpaceImageService,
    private readonly logger: Logger,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all spaces' })
  findAll(): Promise<Space[]> {
    return this.spaceService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get space by id' })
  findOneById(@Param('id') id: string): Promise<Space> {
    return this.spaceService.findOneById(id, ['spaceImages']);
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
    const spaceEvents = await this.spaceEventService.findAll(
      {
        spaceId: id,
        startsAfter: new Date(startDate),
        endsBefore: new Date(endDate),
      },
      false,
    );
    const reservedTimeRanges =
      spaceEvents?.data?.map((spaceEvent) => {
        return {
          startTime: spaceEvent.startsAt,
          endTime: spaceEvent.endsAt,
        };
      }) ?? [];
    const spaceAvailabilityBlock = spaceRule.ruleBlocks.find(
      (item) => item.type === RuleBlockType.spaceAvailability,
    );
    const spaceAvailabilityUnitBlock = spaceRule.ruleBlocks.find(
      (item) => item.type === RuleBlockType.spaceAvailabilityUnit,
    );
    const spaceAvailabilities = spaceAvailabilityBlock.content
      .trim()
      .toLowerCase()
      .split(';')
      .filter((item) => item != null && item !== '');
    const spaceAvailabilityUnit =
      spaceAvailabilityUnitBlock.content as SpaceAvailabilityUnit;

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
}
