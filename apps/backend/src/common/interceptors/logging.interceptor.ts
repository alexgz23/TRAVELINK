import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../logger/logger.service';

/**
 * Interceptor para loguear todas las HTTP requests y responses
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('HTTP');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const userId = request.user?.id || 'anonymous';

    const startTime = Date.now();

    // Log de request entrante
    this.logger.http(`Incoming ${method} ${url}`, {
      method,
      url,
      ip,
      userAgent,
      userId,
    });

    return next.handle().pipe(
      tap({
        next: (data) => {
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;
          const duration = Date.now() - startTime;

          // Log de response exitosa
          this.logger.http(`Outgoing ${method} ${url} ${statusCode}`, {
            method,
            url,
            statusCode,
            duration,
            userId,
            responseSize: data ? JSON.stringify(data).length : 0,
          });

          // Advertir si la request toma mucho tiempo
          if (duration > 3000) {
            this.logger.warn(`Slow request detected: ${method} ${url}`, 'Performance', {
              duration,
              url,
              method,
            });
          }
        },
        error: (error) => {
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;
          const duration = Date.now() - startTime;

          // Log de error
          this.logger.error(
            `Error ${method} ${url} ${statusCode}`,
            error.stack,
            'HTTP',
            {
              method,
              url,
              statusCode,
              duration,
              userId,
              errorMessage: error.message,
              errorName: error.name,
            },
          );
        },
      }),
    );
  }
}
