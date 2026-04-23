import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { GuidesService } from './guides.service';
import { CreateGuideDto, UpdateGuideDto } from './dto/guide.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('guides')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('guides')
export class GuidesController {
  constructor(private readonly guidesService: GuidesService) {}

  @Get()
  @ApiOperation({ summary: 'List all guides for current user' })
  findAll(@CurrentUser('id') userId: string) {
    return this.guidesService.findByOwner(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new guide' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateGuideDto) {
    return this.guidesService.create(userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a guide by ID' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.guidesService.findById(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a guide' })
  update(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() dto: UpdateGuideDto) {
    return this.guidesService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a guide' })
  delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.guidesService.delete(id, userId);
  }
}