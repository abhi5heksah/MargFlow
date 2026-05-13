import { Injectable } from '@nestjs/common';
import { S3Service } from '../../config/minio.config';
import { ConfigService } from '../../config/env.config';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadsService {
  constructor(
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
  ) {}

  async generateScreenshotPresignedUrl(
    userId: string,
    guideId: string,
    fileName: string,
    mimeType: string,
  ) {
    const key = `screenshots/${userId}/${guideId}/${randomUUID()}-${fileName}`;
    const uploadUrl = await this.s3Service.generatePresignedUploadUrl(key, 3600);

    return {
      uploadUrl,
      key,
      expiresIn: 3600,
    };
  }

  async deleteScreenshot(key: string) {
    await this.s3Service.deleteObject(key);
    return { success: true };
  }

  async getViewUrl(key: string) {
    const url = await this.s3Service.generatePresignedDownloadUrl(key, 3600);
    return { url };
  }
}