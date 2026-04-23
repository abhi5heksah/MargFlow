import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { GuidesModule } from '../guides/guides.module';

@Module({
  imports: [GuidesModule],
  controllers: [PublicController],
})
export class PublicModule {}