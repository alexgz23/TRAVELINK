import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as Sentry from '@sentry/node';
import { LoggerService } from '../logger/logger.service';

/**
 * Filtro global de excepciones que integra con Sentry
 */
@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('SentryExceptionFilter');
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Determinar status code
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Obtener mensaje de error
    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: typeof message === 'string' ? message : (message as any).message || 'Error',
      ...(typeof message === 'object' && message !== null ? message : {}),
    };

    // Log del error
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
        'SentryExceptionFilter',
        {
          statusCode: status,
          body: request.body,
          query: request.query,
          params: request.params,
          user: (request as any).user,
        },
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} - ${status}`,
        'SentryExceptionFilter',
        {
          statusCode: status,
          message: errorResponse.message,
        },
      );
    }

    // Enviar a Sentry solo errores 500+
    if (status >= 500 && exception instanceof Error) {
      Sentry.withScope((scope) => {
        // Agregar contexto del request
        scope.setContext('http', {
          method: request.method,
          url: request.url,
          query: request.query,
          body: this.sanitizeBody(request.body),
          headers: this.sanitizeHeaders(request.headers),
        });

        // Agregar contexto del usuario si existe
        const user = (request as any).user;
        if (user) {
          scope.setUser({
            id: user.id || user.sub,
            email: user.email,
            role: user.role,
          });
        }

        // Agregar tags
        scope.setTag('http.status_code', status);
        scope.setTag('http.method', request.method);
        scope.setTag('http.url', request.url);

        // Capturar excepción
        Sentry.captureException(exception);
      });
    }

    // Enviar respuesta al cliente
    response.status(status).json(errorResponse);
  }

  /**
   * Sanitizar body para no enviar información sensible a Sentry
   */
  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sanitized = { ...body };
    const sensitiveFields = ['password', 'passwordHash', 'token', 'accessToken', 'refreshToken', 'secret', 'apiKey'];

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  /**
   * Sanitizar headers para no enviar información sensible
   */
  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];

    for (const header of sensitiveHeaders) {
      if (header in sanitized) {
        sanitized[header] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}
