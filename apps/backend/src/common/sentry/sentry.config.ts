import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

/**
 * Configuración de Sentry
 */
export function initializeSentry() {
  const dsn = process.env.SENTRY_DSN;
  const environment = process.env.NODE_ENV || 'development';
  const release = process.env.SENTRY_RELEASE || 'viajero-conectado@1.0.0';

  // Solo inicializar si hay DSN configurado
  if (!dsn) {
    console.warn('⚠️  Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    release,

    // Performance Monitoring
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0, // 10% en producción, 100% en dev

    // Profiling
    profilesSampleRate: environment === 'production' ? 0.1 : 1.0,
    integrations: [
      nodeProfilingIntegration(),
    ],

    // Error filtering
    beforeSend(event, hint) {
      // No enviar errores de desarrollo
      if (environment === 'development' && !process.env.SENTRY_DEBUG) {
        return null;
      }

      // Filtrar errores conocidos o no importantes
      const error = hint.originalException;
      if (error instanceof Error) {
        // No enviar errores de validación
        if (error.message.includes('validation failed')) {
          return null;
        }
        // No enviar errores de autenticación esperados
        if (error.message.includes('Unauthorized') || error.message.includes('Invalid token')) {
          return null;
        }
      }

      return event;
    },

    // Ignoring transactions
    ignoreTransactions: [
      '/health',
      '/api/health',
      '/metrics',
    ],

    // Breadcrumbs
    maxBreadcrumbs: 50,

    // Debug mode
    debug: process.env.SENTRY_DEBUG === 'true',
  });

  console.log(`✅ Sentry initialized [${environment}]`);
}

/**
 * Capturar excepción en Sentry
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (context) {
    Sentry.setContext('additional', context);
  }
  Sentry.captureException(error);
}

/**
 * Capturar mensaje en Sentry
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level);
}

/**
 * Agregar contexto de usuario
 */
export function setUser(user: { id: string; email?: string; role?: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    role: user.role,
  });
}

/**
 * Limpiar contexto de usuario
 */
export function clearUser() {
  Sentry.setUser(null);
}

/**
 * Agregar tag personalizado
 */
export function setTag(key: string, value: string) {
  Sentry.setTag(key, value);
}

/**
 * Agregar breadcrumb
 */
export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
  Sentry.addBreadcrumb(breadcrumb);
}

/**
 * Cerrar Sentry (para shutdown graceful)
 */
export async function closeSentry() {
  await Sentry.close(2000);
}
