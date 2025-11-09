import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CACHE_KEY_METADATA } from '../decorators/cache-key.decorator';
import { CACHE_TTL_METADATA } from '../decorators/cache-ttl.decorator';
import { LoggerService } from '../logger/logger.service';

/**
 * Interceptor personalizado para cacheo inteligente
 * Soporta claves dinámicas con placeholders como {id}, {userId}
 */
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private reflector: Reflector,
    private logger: LoggerService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const cacheKeyTemplate = this.reflector.get<string>(
      CACHE_KEY_METADATA,
      context.getHandler(),
    );

    // Si no hay clave de cache definida, no cachear
    if (!cacheKeyTemplate) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const { params, query, user } = request;

    // Generar clave dinámica reemplazando placeholders
    const cacheKey = this.generateCacheKey(cacheKeyTemplate, { params, query, user });

    try {
      // Intentar obtener del cache
      const cachedData = await this.cacheManager.get(cacheKey);

      if (cachedData) {
        this.logger.debug(`Cache HIT: ${cacheKey}`, 'CacheInterceptor');
        return of(cachedData);
      }

      this.logger.debug(`Cache MISS: ${cacheKey}`, 'CacheInterceptor');

      // Obtener TTL personalizado o usar el por defecto
      const ttl = this.reflector.get<number>(CACHE_TTL_METADATA, context.getHandler());

      // Si no está en cache, ejecutar el handler y guardar el resultado
      return next.handle().pipe(
        tap(async (data) => {
          try {
            if (ttl) {
              await this.cacheManager.set(cacheKey, data, ttl * 1000); // TTL en milisegundos
            } else {
              await this.cacheManager.set(cacheKey, data);
            }
            this.logger.debug(`Cache SET: ${cacheKey} (TTL: ${ttl || 'default'}s)`, 'CacheInterceptor');
          } catch (error) {
            this.logger.error(
              `Error setting cache for key ${cacheKey}: ${error.message}`,
              error.stack,
              'CacheInterceptor',
            );
          }
        }),
      );
    } catch (error) {
      this.logger.error(
        `Error accessing cache for key ${cacheKey}: ${error.message}`,
        error.stack,
        'CacheInterceptor',
      );
      // Si hay error con el cache, continuar sin cachear
      return next.handle();
    }
  }

  /**
   * Genera la clave de cache reemplazando placeholders
   */
  private generateCacheKey(
    template: string,
    data: { params: any; query: any; user: any },
  ): string {
    let key = template;

    // Reemplazar {id} con params.id
    if (data.params?.id) {
      key = key.replace(/{id}/g, data.params.id);
    }

    // Reemplazar {userId} con user.sub o user.id
    if (data.user) {
      const userId = data.user.sub || data.user.id;
      key = key.replace(/{userId}/g, userId);
    }

    // Reemplazar otros parámetros dinámicos
    Object.keys(data.params || {}).forEach((param) => {
      const placeholder = new RegExp(`{${param}}`, 'g');
      key = key.replace(placeholder, data.params[param]);
    });

    // Agregar query params si existen (para paginación, filtros, etc.)
    const queryString = Object.keys(data.query || {})
      .sort()
      .map((k) => `${k}=${data.query[k]}`)
      .join('&');

    if (queryString) {
      key = `${key}?${queryString}`;
    }

    return key;
  }
}
