import { Injectable, Scope, LoggerService as NestLoggerService } from '@nestjs/common';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
  private context?: string;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * Establece el contexto para los logs
   */
  setContext(context: string): void {
    this.context = context;
  }

  /**
   * Log de nivel DEBUG
   */
  log(message: string, context?: string): void {
    this.info(message, context);
  }

  /**
   * Log de nivel INFO
   */
  info(message: string, context?: string, meta?: any): void {
    const logContext = context || this.context || 'Application';
    this.logger.info(message, { context: logContext, ...meta });
  }

  /**
   * Log de nivel ERROR
   */
  error(message: string, trace?: string, context?: string, meta?: any): void {
    const logContext = context || this.context || 'Application';
    this.logger.error(message, {
      context: logContext,
      trace,
      ...meta,
    });
  }

  /**
   * Log de nivel WARN
   */
  warn(message: string, context?: string, meta?: any): void {
    const logContext = context || this.context || 'Application';
    this.logger.warn(message, { context: logContext, ...meta });
  }

  /**
   * Log de nivel DEBUG
   */
  debug(message: string, context?: string, meta?: any): void {
    const logContext = context || this.context || 'Application';
    this.logger.debug(message, { context: logContext, ...meta });
  }

  /**
   * Log de nivel VERBOSE (usando debug)
   */
  verbose(message: string, context?: string, meta?: any): void {
    this.debug(message, context, meta);
  }

  /**
   * Log de HTTP request
   */
  http(message: string, meta?: any): void {
    this.logger.log('http', message, meta);
  }

  /**
   * Log de operación de base de datos
   */
  database(operation: string, table: string, duration?: number, meta?: any): void {
    this.logger.info(`[DATABASE] ${operation} on ${table}`, {
      context: 'Database',
      operation,
      table,
      duration: duration ? `${duration}ms` : undefined,
      ...meta,
    });
  }

  /**
   * Log de autenticación
   */
  auth(event: string, userId?: string, meta?: any): void {
    this.logger.info(`[AUTH] ${event}`, {
      context: 'Authentication',
      event,
      userId,
      ...meta,
    });
  }

  /**
   * Log de operación de negocio
   */
  business(action: string, entity: string, entityId?: string, meta?: any): void {
    this.logger.info(`[BUSINESS] ${action} ${entity}`, {
      context: 'Business',
      action,
      entity,
      entityId,
      ...meta,
    });
  }

  /**
   * Log de integración externa
   */
  integration(service: string, action: string, success: boolean, meta?: any): void {
    const level = success ? 'info' : 'error';
    this.logger.log(level, `[INTEGRATION] ${service} - ${action}`, {
      context: 'Integration',
      service,
      action,
      success,
      ...meta,
    });
  }

  /**
   * Log de performance
   */
  performance(operation: string, duration: number, meta?: any): void {
    const level = duration > 1000 ? 'warn' : 'info';
    this.logger.log(level, `[PERFORMANCE] ${operation} took ${duration}ms`, {
      context: 'Performance',
      operation,
      duration,
      ...meta,
    });
  }

  /**
   * Log de security event
   */
  security(event: string, severity: 'low' | 'medium' | 'high' | 'critical', meta?: any): void {
    const level = severity === 'critical' || severity === 'high' ? 'error' : 'warn';
    this.logger.log(level, `[SECURITY] ${event}`, {
      context: 'Security',
      event,
      severity,
      ...meta,
    });
  }

  /**
   * Log estructurado genérico
   */
  structured(level: string, message: string, meta: Record<string, any>): void {
    this.logger.log(level, message, meta);
  }
}
