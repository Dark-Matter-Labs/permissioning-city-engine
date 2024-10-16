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
} from '@nestjs/common';
import { SpaceService } from './space.service';
import { Space } from '../../database/entity/space.entity';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateSpaceDto } from './dto/create-space.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateSpaceDto } from './dto';
import { UpdateResult } from 'typeorm';
import { UserService } from '../user/user.service';
import { SpacePermissioner } from 'src/database/entity/space-permissioner.entity';
import { SpacePermissionerService } from '../space-permissioner/space-permissioner.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SpaceImageService } from '../space-image/space-image.service';
import { Logger } from 'src/lib/logger/logger.service';

@ApiTags('space')
@Controller('api/v1/space')
export class SpaceController {
  constructor(
    private readonly spaceService: SpaceService,
    private readonly userService: UserService,
    private readonly spacePermissionerService: SpacePermissionerService,
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
    return this.spaceService.findOneById(id);
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
  ): Promise<{ space: Space; spacePermissioner: SpacePermissioner }> {
    const { images } = uploadedFiles;
    const user = await this.userService.findOneByEmail(req.user.email);
    const space = await this.spaceService.create(user.id, createSpaceDto);
    const spacePermissioner = await this.spacePermissionerService.create(
      {
        spaceId: space.id,
        userId: user.id,
      },
      true,
    );

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

    return { space, spacePermissioner };
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
  ): Promise<UpdateResult> {
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
