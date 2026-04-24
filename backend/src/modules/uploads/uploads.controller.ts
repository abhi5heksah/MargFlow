import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { UploadsService } from './uploads.service';
import { GeneratePresignedUrlDto } from './dto/upload.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('uploads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('screenshot-presigned')
  @ApiOperation({ summary: 'Generate presigned URL for screenshot upload' })
  generateScreenshotPresigned(
    @CurrentUser('id') userId: string,
    @Body() dto: GeneratePresignedUrlDto,
  ) {
    return this.uploadsService.generateScreenshotPresignedUrl(
      userId,
      dto.guideId || 'pending',
      dto.fileName,
      dto.mimeType,
    );
  }

  @Get('view/:key(*)')
  @ApiOperation({ summary: 'Get presigned URL for viewing uploaded file' })
  getViewUrl(@Param('key') key: string) {
    const decodedKey = decodeURIComponent(key);
    return this.uploadsService.getViewUrl(decodedKey);
  }
}