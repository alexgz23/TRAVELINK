import { BullModuleOptions } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';

export const bullConfig = (configService: ConfigService): BullModuleOptions => ({
  redis: {
    host: configService.get<string>('REDIS_HOST', 'localhost'),
    port: configService.get<number>('REDIS_PORT', 6379),
    password: configService.get<string>('REDIS_PASSWORD'),
    db: configService.get<number>('REDIS_DB', 0),
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: 100, // Mantener últimos 100 jobs completados
    removeOnFail: 500, // Mantener últimos 500 jobs fallidos
  },
});
