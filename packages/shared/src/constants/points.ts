import { PointsEarnReason, UserLevel } from '@viajero-conectado/types';

/**
 * Puntos otorgados por acción
 */
export const POINTS_CONFIG: Record<PointsEarnReason, number> = {
  [PointsEarnReason.BOOKING_COMPLETED]: 100,
  [PointsEarnReason.REVIEW_WITH_PHOTO]: 50,
  [PointsEarnReason.REVIEW_WITH_VIDEO]: 75,
  [PointsEarnReason.STORY_PUBLISHED]: 20,
  [PointsEarnReason.POST_PUBLISHED]: 15,
  [PointsEarnReason.REFERRAL]: 200,
  [PointsEarnReason.FIRST_BOOKING]: 150,
  [PointsEarnReason.CHALLENGE_COMPLETED]: 100,
  [PointsEarnReason.PROFILE_COMPLETED]: 50,
  [PointsEarnReason.NEW_AGENCY_BOOKING]: 75,
  [PointsEarnReason.PRODUCT_PURCHASE]: 50,
};

/**
 * Límite semanal de puntos
 */
export const WEEKLY_POINTS_LIMIT = 1000;

/**
 * Días de expiración de puntos
 */
export const POINTS_EXPIRATION_DAYS = 365;

/**
 * Umbrales de niveles (puntos lifetime necesarios)
 */
export const LEVEL_THRESHOLDS: Record<UserLevel, number> = {
  [UserLevel.EXPLORADOR]: 0,
  [UserLevel.CAMINANTE]: 500,
  [UserLevel.VIAJERO_ACTIVO]: 2000,
  [UserLevel.VIAJERO_EXPERTO]: 5000,
  [UserLevel.EMBAJADOR]: 10000,
};

/**
 * Beneficios por nivel
 */
export const LEVEL_BENEFITS: Record<UserLevel, string[]> = {
  [UserLevel.EXPLORADOR]: ['Acceso a la plataforma', 'Descuentos básicos'],
  [UserLevel.CAMINANTE]: ['5% descuento en experiencias', 'Prioridad en soporte'],
  [UserLevel.VIAJERO_ACTIVO]: [
    '10% descuento en experiencias',
    'Acceso anticipado a ofertas',
    'Badge en perfil',
  ],
  [UserLevel.VIAJERO_EXPERTO]: [
    '15% descuento en experiencias',
    'Upgrades gratuitos',
    'Acceso a eventos exclusivos',
  ],
  [UserLevel.EMBAJADOR]: [
    '20% descuento en experiencias',
    'Experiencias VIP gratuitas',
    'Merchandise exclusivo',
    'Programa de embajadores',
  ],
};
