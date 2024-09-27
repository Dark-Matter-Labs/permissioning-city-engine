import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { SpaceService } from './space.service';
import { Space } from '../../database/entity/space.entity';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateSpaceDto } from './dto/create-space.dto';

@ApiTags('space')
@Controller('api/v1/space')
export class SpaceController {
  constructor(private readonly spaceService: SpaceService) {}

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

  @Get('name/:name')
  @ApiOperation({ summary: 'Get space by name' })
  findByName(@Param('id') id: string): Promise<Space> {
    return this.spaceService.findOneByName(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a space' })
  create(@Body() createSpaceDto: CreateSpaceDto): Promise<Space> {
    return this.spaceService.create(createSpaceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a space' })
  remove(@Param('id') id: string): Promise<void> {
    return this.spaceService.remove(id);
  }
}
