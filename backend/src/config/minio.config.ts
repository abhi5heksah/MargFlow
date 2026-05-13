import { Module, Global, Injectable, Inject } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from './env.config';

@Injectable()
export class S3Service {
  constructor(
    @Inject('S3_CLIENT') private readonly s3Client: S3Client,
    @Inject('MINIO_BUCKET') private readonly bucket: string,
  ) {}

  async generatePresignedUploadUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async generatePresignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async deleteObject(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    await this.s3Client.send(command);
  }

  getBucket(): string {
    return this.bucket;
  }
}

@Global()
@Module({
  providers: [
    {
      provide: 'S3_CLIENT',
      inject: [ConfigService],
      useFactory: (config: ConfigService): S3Client => {
        return new S3Client({
          region: config.get('MINIO_REGION') || 'us-east-1',
          endpoint: `http://${config.get('MINIO_ENDPOINT')}`,
          credentials: {
            accessKeyId: config.getRequired('MINIO_ACCESS_KEY'),
            secretAccessKey: config.getRequired('MINIO_SECRET_KEY'),
          },
          forcePathStyle: true,
        });
      },
    },
    {
      provide: 'MINIO_BUCKET',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.getRequired('MINIO_BUCKET'),
    },
    S3Service,
  ],
  exports: [S3Service],
})
export class MinioModule {}