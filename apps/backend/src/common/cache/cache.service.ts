import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { LoggerService } from '../logger/logger.service';

/**
 * Servicio para operaciones manuales de cache
 * Útil para invalidación, precarga, y operaciones complejas
 */
@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private logger: LoggerService,
  ) {}

  /**
   * Obtener un valor del cache
   */
  async get<T>(key: string): Promise<T | undefined> {
    try {
      const value = await this.cacheManager.get<T>(key);
      if (value) {
        this.logger.debug(`Cache HIT: ${key}`, 'CacheService');
      } else {
        this.logger.debug(`Cache MISS: ${key}`, 'CacheService');
      }
      return value;
    } catch (error) {
      this.logger.error(`Error getting cache key ${key}: ${error.message}`, error.stack, 'CacheService');
      return undefined;
    }
  }

  /**
   * Guardar un valor en el cache
   * @param key - Clave del cache
   * @param value - Valor a guardar
   * @param ttl - Tiempo de vida en segundos (opcional)
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.cacheManager.set(key, value, ttl * 1000); // TTL en milisegundos
      } else {
        await this.cacheManager.set(key, value);
      }
      this.logger.debug(`Cache SET: ${key} (TTL: ${ttl || 'default'}s)`, 'CacheService');
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}: ${error.message}`, error.stack, 'CacheService');
    }
  }

  /**
   * Eliminar una clave del cache
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Cache DEL: ${key}`, 'CacheService');
    } catch (error) {
      this.logger.error(`Error deleting cache key ${key}: ${error.message}`, error.stack, 'CacheService');
    }
  }

  /**
   * Eliminar múltiples claves que coincidan con un patrón
   * Ejemplo: invalidatePattern('user:*') elimina todas las claves que empiecen con 'user:'
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      // Esta función requiere acceso directo al cliente de Redis
      // Nota: cache-manager v7 usa un wrapper, necesitamos acceder al cliente
      const store: any = this.cacheManager['store'];

      if (store && store.client && typeof store.client.keys === 'function') {
        const keys = await store.client.keys(pattern);
        if (keys.length > 0) {
          await Promise.all(keys.map((key: string) => this.del(key)));
          this.logger.log(`Invalidated ${keys.length} cache keys matching pattern: ${pattern}`, 'CacheService');
        }
      } else {
        this.logger.warn('Pattern invalidation not supported by cache store', 'CacheService');
      }
    } catch (error) {
      this.logger.error(
        `Error invalidating cache pattern ${pattern}: ${error.message}`,
        error.stack,
        'CacheService',
      );
    }
  }

  /**
   * Limpiar todo el cache
   */
  async reset(): Promise<void> {
    try {
      // cache-manager v7 no tiene reset, usamos el cliente de Redis directamente
      const store: any = this.cacheManager['store'];
      if (store && store.client && typeof store.client.flushDb === 'function') {
        await store.client.flushDb();
        this.logger.warn('Cache RESET: All keys deleted', 'CacheService');
      } else {
        this.logger.warn('Cache reset not supported by store', 'CacheService');
      }
    } catch (error) {
      this.logger.error(`Error resetting cache: ${error.message}`, error.stack, 'CacheService');
    }
  }

  /**
   * Obtener o computar un valor
   * Si existe en cache, lo retorna. Si no, ejecuta la función y lo guarda.
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const cached = await this.get<T>(key);

    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }

  /**
   * Invalidar cache relacionado con un usuario
   */
  async invalidateUserCache(userId: string): Promise<void> {
    await this.invalidatePattern(`user:${userId}:*`);
    await this.invalidatePattern(`*:userId:${userId}:*`);
  }

  /**
   * Invalidar cache relacionado con una experiencia
   */
  async invalidateExperienceCache(experienceId: string): Promise<void> {
    await this.invalidatePattern(`experience:${experienceId}:*`);
    await this.invalidatePattern(`experiences:*`); // Invalidar listas
  }

  /**
   * Invalidar cache relacionado con reservas
   */
  async invalidateBookingCache(bookingId: string, userId: string): Promise<void> {
    await this.del(`booking:${bookingId}`);
    await this.invalidatePattern(`bookings:user:${userId}:*`);
  }
}
