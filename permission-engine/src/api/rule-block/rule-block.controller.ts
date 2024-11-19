import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RuleBlock } from '../../database/entity/rule-block.entity';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateRuleBlockDto, FindAllRuleBlockDto } from './dto';
import { RuleBlockService } from './rule-block.service';
import { UserService } from '../user/user.service';
import { Logger } from 'src/lib/logger/logger.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { RuleBlockContentDivider, RuleBlockType } from 'src/lib/type';
import { SpaceEquipmentService } from '../space-equipment/space-equipment.service';

@ApiTags('rule')
@Controller('api/v1/rule/block')
export class RuleBlockController {
  constructor(
    private readonly ruleBlockService: RuleBlockService,
    private readonly userService: UserService,
    private readonly spaceEquipmentService: SpaceEquipmentService,
    private readonly logger: Logger,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get RuleBlock by authorId' })
  async findAll(
    @Query() query: FindAllRuleBlockDto,
  ): Promise<{ data: RuleBlock[]; total: number }> {
    const { page, limit, hash, type, authorId, ids } = query;

    return await this.ruleBlockService.findAll({
      page,
      limit,
      hash,
      type,
      authorId,
      ids,
    });
  }

  @Get('hash/:hash')
  @ApiOperation({ summary: 'Get RuleBlock by hash' })
  findOneByHash(@Param('hash') hash: string): Promise<RuleBlock> {
    return this.ruleBlockService.findOneByHash(hash);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get RuleBlock by id' })
  findOneById(@Param('id') id: string): Promise<RuleBlock> {
    return this.ruleBlockService.findOneById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: CreateRuleBlockDto })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'files', maxCount: 1 }], {
      fileFilter(req, file, cb) {
        if (file.size > 10485760) {
          cb(new BadRequestException('file size cannot exceed 10Mb'), false);
        }

        if (
          ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(
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
  @ApiOperation({ summary: 'Create a RuleBlock' })
  async create(
    @Req() req,
    @UploadedFiles() uploadedFiles: { files: Express.MulterS3.File[] },
    @Body() createRuleBlockDto: CreateRuleBlockDto,
  ): Promise<RuleBlock> {
    const { type, content } = createRuleBlockDto;
    const user = await this.userService.findOneByEmail(req.user.email);
    const { files } = uploadedFiles;

    if (files?.length > 1) {
      throw new BadRequestException('Only 1 file is allowed');
    }

    // will take the first file only
    const file = files?.[0];

    if (file) {
      createRuleBlockDto.id = file.key.split('_')[0];
      createRuleBlockDto.content = file.location;
      createRuleBlockDto.files = [file];
    }

    if (type === RuleBlockType.spaceEventRequireEquipment) {
      const [spaceEquipmentId, quantity] = content.split(
        RuleBlockContentDivider.type,
      );

      const spaceEquipment =
        await this.spaceEquipmentService.findOneById(spaceEquipmentId);

      if (parseInt(quantity) > spaceEquipment.quantity) {
        throw new BadRequestException(
          `Cannot exceed space equipment quantity: ${spaceEquipment.quantity}`,
        );
      }
    }

    return this.ruleBlockService.create(user.id, createRuleBlockDto);
  }
}
