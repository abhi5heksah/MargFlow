import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { GuidesService } from '../guides/guides.service';

@ApiTags('public')
@Controller('public')
export class PublicController {
  constructor(private readonly guidesService: GuidesService) {}

  @Public()
  @Get('guides/:slug')
  @ApiOperation({ summary: 'Get a published guide by slug' })
  getPublicGuide(@Param('slug') slug: string) {
    return this.guidesService.findBySlug(slug);
  }
}