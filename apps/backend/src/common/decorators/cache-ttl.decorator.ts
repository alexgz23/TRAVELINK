import { SetMetadata } from '@nestjs/common';

export const CACHE_TTL_METADATA = 'cache_ttl';

/**
 * Decorador para definir el TTL (Time To Live) del cache en segundos
 * @param ttl - Tiempo de vida en segundos
 */
export const CacheTTL = (ttl: number) => SetMetadata(CACHE_TTL_METADATA, ttl);
