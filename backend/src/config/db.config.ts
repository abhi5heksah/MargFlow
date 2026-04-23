import { Module, Global } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from './env.config';

@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE_URL',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.getRequired('DATABASE_URL'),
    },
    {
      provide: PrismaClient,
      useFactory: () => {
        const client = new PrismaClient();
        return client;
      },
    },
    PrismaClient,
  ],
  exports: [PrismaClient],
})
export class DbModule {}