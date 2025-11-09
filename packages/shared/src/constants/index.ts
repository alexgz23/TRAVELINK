export * from './countries';
export * from './points';

/**
 * Configuración general
 */
export const APP_CONFIG = {
  DEFAULT_LANGUAGE: 'es',
  DEFAULT_CURRENCY: 'COP',
  DEFAULT_COUNTRY: 'CO',
  ITEMS_PER_PAGE: 20,
  MAX_UPLOAD_SIZE_MB: 10,
  MAX_VIDEO_SIZE_MB: 50,
} as const;

/**
 * Regex patterns comunes
 */
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  USERNAME: /^[a-zA-Z0-9_-]{3,20}$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
} as const;

/**
 * Mensajes de error comunes
 */
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'No autorizado',
  FORBIDDEN: 'Acceso denegado',
  NOT_FOUND: 'Recurso no encontrado',
  VALIDATION_ERROR: 'Error de validación',
  INTERNAL_ERROR: 'Error interno del servidor',
  EMAIL_ALREADY_EXISTS: 'El email ya está registrado',
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  TOKEN_EXPIRED: 'Token expirado',
  INSUFFICIENT_PERMISSIONS: 'Permisos insuficientes',
} as const;
