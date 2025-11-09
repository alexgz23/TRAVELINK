import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY_METADATA = 'cache_key';

/**
 * Decorador para definir la clave de cache personalizada
 * @param key - Clave base para el cache (puede usar {id}, {userId}, etc. como placeholders)
 */
export const CacheKey = (key: string) => SetMetadata(CACHE_KEY_METADATA, key);
