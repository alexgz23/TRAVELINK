import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

export const redisConfig: CacheModuleAsyncOptions = {
  isGlobal: true,
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => {
    const store = await redisStore({
      socket: {
        host: configService.get<string>('REDIS_HOST', 'localhost'),
        port: configService.get<number>('REDIS_PORT', 6379),
      },
      password: configService.get<string>('REDIS_PASSWORD'),
      database: configService.get<number>('REDIS_DB', 0),
      ttl: configService.get<number>('CACHE_TTL', 300), // 5 minutos por defecto
    });

    return {
      store,
    };
  },
  inject: [ConfigService],
};
