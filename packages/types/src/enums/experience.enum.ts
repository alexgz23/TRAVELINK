/**
 * Categorías de experiencias
 */
export enum ExperienceCategory {
  TOUR = 'tour',
  ACTIVITY = 'activity',
  TRANSPORT = 'transport',
  PACKAGE = 'package',
  ACCOMMODATION = 'accommodation',
  FOOD_DRINK = 'food_drink',
  WELLNESS = 'wellness',
}

/**
 * Nivel de dificultad
 */
export enum DifficultyLevel {
  EASY = 'easy',
  MODERATE = 'moderate',
  HARD = 'hard',
  EXPERT = 'expert',
}

/**
 * Estados de experiencia
 */
export enum ExperienceStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  PAUSED = 'paused',
  ARCHIVED = 'archived',
}

/**
 * Tipos de público objetivo
 */
export enum AudienceType {
  SOLO = 'solo',
  COUPLE = 'couple',
  FAMILY = 'family',
  GROUP = 'group',
  BUSINESS = 'business',
}
