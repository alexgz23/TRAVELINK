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
    const { method, url, headers, body, query, params } = request;

    // Crear transacción de Sentry
    const transaction = Sentry.startTransaction({
      op: 'http.server',
      name: `${method} ${url}`,
      data: {
        method,
        url,
        query,
        params,
      },
    });

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

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          transaction.setStatus('ok');
          transaction.setData('duration', duration);
          transaction.finish();

          // Limpiar contexto de usuario
          Sentry.setUser(null);
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          transaction.setStatus('internal_error');
          transaction.setData('duration', duration);
          transaction.setData('error', error.message);
          transaction.finish();

          // El error será capturado por SentryExceptionFilter
          // Limpiar contexto de usuario
          Sentry.setUser(null);
        },
      }),
    );
  }
}
