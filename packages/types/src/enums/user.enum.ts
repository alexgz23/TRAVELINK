/**
 * Roles de usuario en la plataforma
 */
export enum UserRole {
  VIAJERO = 'viajero',
  AGENCIA = 'agencia',
  HOTEL = 'hotel',
  GUIA = 'guia',
  CONDUCTOR = 'conductor',
  ALIADO_PRODUCTOS = 'aliado_productos',
  ADMIN = 'admin',
}

/**
 * Estados de usuario
 */
export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
  PENDING_VERIFICATION = 'pending_verification',
}

/**
 * Niveles del sistema de puntos
 */
export enum UserLevel {
  EXPLORADOR = 'explorador',
  CAMINANTE = 'caminante',
  VIAJERO_ACTIVO = 'viajero_activo',
  VIAJERO_EXPERTO = 'viajero_experto',
  EMBAJADOR = 'embajador',
}

/**
 * Género
 */
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}
