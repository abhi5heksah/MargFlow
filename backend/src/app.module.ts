import { Module } from '@nestjs/common';
import { ConfigModule } from './config/env.config';
import { DbModule } from './config/db.config';
import { MinioModule } from './config/minio.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { GuidesModule } from './modules/guides/guides.module';
import { StepsModule } from './modules/steps/steps.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { PublicModule } from './modules/public/public.module';

@Module({
  imports: [
    ConfigModule,
    DbModule,
    MinioModule,
    AuthModule,
    UsersModule,
    GuidesModule,
    StepsModule,
    UploadsModule,
    PublicModule,
  ],
})
export class AppModule {}