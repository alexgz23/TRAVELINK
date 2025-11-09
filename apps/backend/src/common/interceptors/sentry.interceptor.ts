import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as Sentry from '@sentry/node';

/**
 * Interceptor para agregar contexto de Sentry a cada request
 */
@Injectable()
export class SentryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, query, params } = request;

    // Agregar contexto del usuario si existe
    const user = request.user;
    if (user) {
      Sentry.setUser({
        id: user.id || user.sub,
        email: user.email,
        role: user.role,
      });
    }

    // Agregar breadcrumb
    Sentry.addBreadcrumb({
      category: 'http',
      message: `${method} ${url}`,
      level: 'info',
      data: {
        method,
        url,
        query,
        params,
      },
    });

    return next.handle().pipe(
      tap({
        next: () => {
          // Limpiar contexto de usuario después de la request
          Sentry.setUser(null);
        },
        error: () => {
          // El error será capturado por SentryExceptionFilter
          // Limpiar contexto de usuario
          Sentry.setUser(null);
        },
      }),
    );
  }
}
